from django.db import models
from django.utils import timezone

from apps.core.models import TimeStampedModel

from . import constants as c


class Inquiry(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = "new", "Nová"
        IN_PROGRESS = "in_progress", "Rieši sa"
        QUOTED = "quoted", "Odoslaná ponuka"
        CLOSED = "closed", "Uzavretá"
        SPAM = "spam", "Spam"

    name = models.CharField("meno a priezvisko", max_length=c.NAME_MAX)
    email = models.EmailField("e-mail", max_length=c.EMAIL_MAX)
    phone = models.CharField("telefón", max_length=c.PHONE_MAX, blank=True)
    service = models.ForeignKey(
        "services.Service",
        verbose_name="služba",
        related_name="inquiries",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    location = models.CharField("lokalita stavby", max_length=c.LOCATION_MAX, blank=True)
    message = models.TextField("správa", max_length=c.MESSAGE_MAX)
    consent = models.BooleanField("súhlas so spracovaním údajov", default=False)

    status = models.CharField(
        "stav", max_length=20, choices=Status.choices, default=Status.NEW, db_index=True
    )
    internal_note = models.TextField("interná poznámka", blank=True)

    ip_address = models.GenericIPAddressField("IP adresa", null=True, blank=True, editable=False)
    user_agent = models.CharField("prehliadač", max_length=300, blank=True, editable=False)
    notified_at = models.DateTimeField("notifikácia odoslaná", null=True, blank=True, editable=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "dopyt"
        verbose_name_plural = "dopyty"

    def __str__(self) -> str:
        if not self.created_at:
            return self.name
        return f"{self.name} – {timezone.localtime(self.created_at):%d.%m.%Y %H:%M}"
