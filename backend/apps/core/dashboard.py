"""Unfold admin callbacks: dashboard data and environment badge."""

from datetime import timedelta

from django.conf import settings
from django.urls import reverse
from django.utils import timezone

from apps.inquiries.models import Inquiry
from apps.portfolio.models import Project, ProjectImage
from apps.services.models import Service


def dashboard_callback(request, context: dict) -> dict:
    since = timezone.now() - timedelta(days=30)
    inquiries_url = reverse("admin:inquiries_inquiry_changelist")
    new_count = Inquiry.objects.filter(status=Inquiry.Status.NEW).count()

    context.update(
        {
            "kpis": [
                {
                    "title": "Nové dopyty",
                    "value": new_count,
                    "footer": "čakajú na spracovanie",
                    "href": f"{inquiries_url}?status__exact={Inquiry.Status.NEW}",
                    "highlight": new_count > 0,
                },
                {
                    "title": "Dopyty za 30 dní",
                    "value": Inquiry.objects.filter(created_at__gte=since).exclude(status=Inquiry.Status.SPAM).count(),
                    "footer": "bez spamu",
                    "href": inquiries_url,
                },
                {
                    "title": "Zverejnené projekty",
                    "value": Project.objects.published().count(),
                    "footer": f"{ProjectImage.objects.filter(project__is_published=True).count()} fotografií",
                    "href": reverse("admin:portfolio_project_changelist"),
                },
                {
                    "title": "Aktívne služby",
                    "value": Service.objects.published().count(),
                    "footer": "zobrazené na webe",
                    "href": reverse("admin:services_service_changelist"),
                },
            ],
            "latest_inquiries": Inquiry.objects.select_related("service").exclude(status=Inquiry.Status.SPAM)[:8],
            "site_url": settings.FRONTEND_URL,
        }
    )
    return context


def environment_callback(request) -> list[str] | None:
    """Show a coloured environment badge in the admin header while developing."""
    if settings.DEBUG:
        return ["Vývoj", "warning"]
    return None
