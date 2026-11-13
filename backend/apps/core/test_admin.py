"""Smoke tests for the Unfold admin: every page renders, dashboard and inquiry workflow work."""

import io

from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import RequestFactory
from django.urls import reverse
from django.utils import translation

from apps.inquiries.admin import new_inquiries_badge
from apps.inquiries.models import Inquiry
from apps.portfolio.models import Project
from apps.services.models import Service

from .testing import MediaTestCase


class AdminTests(MediaTestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo", images=1, stdout=io.StringIO())
        cls.user = User.objects.create_superuser("admin", "admin@example.sk", "heslo-12345")
        cls.inquiry = Inquiry.objects.create(
            name="Ján Kováč", email="jan@example.sk", message="Dobrý deň, prosím o ponuku.", consent=True
        )

    def setUp(self):
        self.client.force_login(self.user)

    def test_dashboard_shows_kpis_and_latest_inquiries(self):
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Nové dopyty")
        self.assertContains(response, "Ján Kováč")
        self.assertEqual(response.context["kpis"][0]["value"], 1)

    def test_changelists_and_change_forms_render(self):
        project = Project.objects.first()
        service = Service.objects.first()
        urls = [
            reverse("admin:inquiries_inquiry_changelist"),
            reverse("admin:inquiries_inquiry_change", args=[self.inquiry.pk]),
            reverse("admin:portfolio_project_changelist"),
            reverse("admin:portfolio_project_change", args=[project.pk]),
            reverse("admin:portfolio_project_add"),
            reverse("admin:portfolio_projectcategory_changelist"),
            reverse("admin:services_service_changelist"),
            reverse("admin:services_service_change", args=[service.pk]),
            reverse("admin:core_stat_changelist"),
            reverse("admin:core_guarantee_changelist"),
            reverse("admin:core_certification_changelist"),
            reverse("admin:core_teammember_changelist"),
            reverse("admin:auth_user_changelist"),
            reverse("admin:auth_user_change", args=[self.user.pk]),
            reverse("admin:auth_group_changelist"),
        ]
        for url in urls:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)

    def test_inquiries_cannot_be_added_manually(self):
        response = self.client.get(reverse("admin:inquiries_inquiry_add"))
        self.assertEqual(response.status_code, 403)

    def test_bulk_status_action(self):
        response = self.client.post(
            reverse("admin:inquiries_inquiry_changelist"),
            {"action": "mark_closed", "_selected_action": [self.inquiry.pk]},
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.inquiry.refresh_from_db()
        self.assertEqual(self.inquiry.status, Inquiry.Status.CLOSED)

    def test_new_inquiries_badge(self):
        request = RequestFactory().get("/")
        self.assertEqual(new_inquiries_badge(request), "1")
        Inquiry.objects.update(status=Inquiry.Status.CLOSED)
        self.assertEqual(new_inquiries_badge(request), "")

    def test_login_without_next_lands_on_dashboard(self):
        self.client.logout()
        response = self.client.post(reverse("admin:login"), {"username": "admin", "password": "heslo-12345"})
        self.assertRedirects(response, reverse("admin:index"))

    def test_unfold_strings_are_translated_to_slovak(self):
        with translation.override("sk"):
            self.assertEqual(translation.gettext("Toggle sidebar"), "Zobraziť/skryť bočný panel")
            self.assertEqual(translation.gettext("Search apps and models..."), "Hľadať v administrácii…")
