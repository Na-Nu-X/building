from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.services.models import Service

from . import constants as c
from .models import Inquiry

VALID = {
    "name": "  Ján   Kováč ",
    "email": "Jan.Kovac@Example.SK",
    "phone": "+421 905 123 456",
    "service": "sadrokartony",
    "location": "Trnava",
    "message": "Dobrý deň, mám záujem o cenovú ponuku na podkrovie.",
    "consent": True,
}


@override_settings(INQUIRY_NOTIFY_EMAILS=["firma@example.sk"])
class InquiryApiTests(APITestCase):
    url = reverse("api:inquiry-create")

    def setUp(self):
        cache.clear()  # reset throttling between tests
        Service.objects.create(title="Sadrokartóny", short_description="x")

    def post(self, **overrides):
        return self.client.post(self.url, {**VALID, **overrides}, format="json", REMOTE_ADDR="10.0.0.5")

    def test_valid_inquiry_is_saved_normalized_and_notified(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.post()

        self.assertEqual(response.status_code, 201)
        inquiry = Inquiry.objects.get()
        self.assertEqual(inquiry.name, "Ján Kováč")
        self.assertEqual(inquiry.email, "jan.kovac@example.sk")
        self.assertEqual(inquiry.service.slug, "sadrokartony")
        self.assertEqual(inquiry.ip_address, "10.0.0.5")
        self.assertEqual(inquiry.status, Inquiry.Status.NEW)
        self.assertIsNotNone(inquiry.notified_at)

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, ["firma@example.sk"])
        self.assertEqual(email.reply_to, ["jan.kovac@example.sk"])
        self.assertIn("Ján Kováč", email.subject)
        self.assertIn("podkrovie", email.body)

    def test_service_and_optional_fields_can_be_omitted(self):
        payload = {k: VALID[k] for k in ("name", "email", "message", "consent")}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIsNone(Inquiry.objects.get().service)

    def test_honeypot_pretends_success_but_stores_nothing(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.post(website="http://spam.example")
        self.assertEqual(response.status_code, 201)
        self.assertFalse(Inquiry.objects.exists())
        self.assertEqual(mail.outbox, [])

    def test_validation_errors_are_reported_per_field(self):
        response = self.post(name="J", email="zly-email", phone="abc", message="Krátka", consent=False)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.data), {"name", "email", "phone", "message", "consent"})
        self.assertFalse(Inquiry.objects.exists())

    def test_message_length_limits(self):
        self.assertEqual(self.post(message=" " * 30 + "x" * (c.MESSAGE_MIN - 1)).status_code, 400)
        self.assertEqual(self.post(message="x" * (c.MESSAGE_MAX + 1)).status_code, 400)
        self.assertEqual(self.post(message="x" * c.MESSAGE_MAX).status_code, 201)

    def test_unknown_or_unpublished_service_is_rejected(self):
        Service.objects.create(title="Skrytá", short_description="x", is_published=False)
        self.assertEqual(self.post(service="neexistuje").status_code, 400)
        self.assertEqual(self.post(service="skryta").status_code, 400)

    @override_settings(INQUIRY_NOTIFY_EMAILS=[])
    def test_missing_recipients_does_not_break_submission(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.post()
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(Inquiry.objects.get().notified_at)

    def test_get_is_not_allowed(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)

    def test_submissions_are_rate_limited(self):
        from rest_framework.settings import api_settings
        from rest_framework.throttling import ScopedRateThrottle

        ScopedRateThrottle.THROTTLE_RATES = {**api_settings.DEFAULT_THROTTLE_RATES, "inquiries": "2/hour"}
        try:
            statuses = [self.post().status_code for _ in range(3)]
        finally:
            ScopedRateThrottle.THROTTLE_RATES = api_settings.DEFAULT_THROTTLE_RATES
        self.assertEqual(statuses, [201, 201, 429])


class MailerSettingsTests(APITestCase):
    """Regression: SMTP env vars must not break non-SMTP backends (Django 6.1 rejects unknown options)."""

    def test_console_backend_ignores_smtp_environment(self):
        import importlib
        import os
        from unittest import mock

        from django.core.mail import get_connection

        env = {
            "EMAIL_BACKEND": "django.core.mail.backends.console.EmailBackend",
            "EMAIL_HOST": "smtp.example.sk",
            "EMAIL_PORT": "587",
            "EMAIL_USE_TLS": "True",
            "EMAIL_HOST_USER": "",
        }
        with mock.patch.dict(os.environ, env):
            import config.settings as settings_module

            reloaded = importlib.reload(settings_module)
        self.assertEqual(reloaded.MAILERS["default"]["OPTIONS"], {})

        with mock.patch.dict(os.environ, {**env, "EMAIL_BACKEND": "django.core.mail.backends.smtp.EmailBackend"}):
            reloaded = importlib.reload(settings_module)
        self.assertEqual(
            reloaded.MAILERS["default"]["OPTIONS"], {"host": "smtp.example.sk", "port": 587, "use_tls": True}
        )
        importlib.reload(settings_module)  # restore module state for other tests

        with override_settings(MAILERS={"default": {"BACKEND": env["EMAIL_BACKEND"], "OPTIONS": {}}}):
            get_connection()  # must not raise InvalidMailer
