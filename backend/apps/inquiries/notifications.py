import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

from .models import Inquiry

logger = logging.getLogger(__name__)


def notify_new_inquiry(inquiry_id: int) -> None:
    """Email the company about a new inquiry. Failures are logged, never raised."""
    recipients = settings.INQUIRY_NOTIFY_EMAILS
    if not recipients:
        logger.warning("INQUIRY_NOTIFY_EMAIL is not set; skipping notification.")
        return

    inquiry = Inquiry.objects.select_related("service").get(pk=inquiry_id)
    context = {"inquiry": inquiry}
    subject = f"Nový dopyt z webu: {inquiry.name}"
    if inquiry.service:
        subject += f" ({inquiry.service.title})"

    message = EmailMultiAlternatives(
        subject=subject,
        body=render_to_string("inquiries/email/new_inquiry.txt", context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipients,
        reply_to=[inquiry.email],
    )
    message.attach_alternative(
        render_to_string("inquiries/email/new_inquiry.html", context), "text/html"
    )
    try:
        message.send()
    except Exception:
        logger.exception("Failed to send notification for inquiry %s", inquiry_id)
        return
    Inquiry.objects.filter(pk=inquiry_id).update(notified_at=timezone.now())
