import re

from rest_framework import serializers

from apps.services.models import Service

from . import constants as c
from .models import Inquiry

PHONE_RE = re.compile(c.PHONE_PATTERN)


def _collapse_whitespace(value: str) -> str:
    return " ".join(value.split())


class InquiryCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=c.NAME_MIN, max_length=c.NAME_MAX)
    email = serializers.EmailField(max_length=c.EMAIL_MAX)
    phone = serializers.CharField(max_length=c.PHONE_MAX, required=False, allow_blank=True)
    service = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Service.objects.published(),
        required=False,
        allow_null=True,
    )
    location = serializers.CharField(max_length=c.LOCATION_MAX, required=False, allow_blank=True)
    message = serializers.CharField(min_length=c.MESSAGE_MIN, max_length=c.MESSAGE_MAX)
    consent = serializers.BooleanField()
    # Honeypot: hidden in the UI, real users leave it empty.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    default_error_messages = {"consent": "Pre odoslanie je potrebný súhlas so spracovaním údajov."}

    class Meta:
        model = Inquiry
        fields = ["name", "email", "phone", "service", "location", "message", "consent", "website"]

    def validate_name(self, value: str) -> str:
        value = _collapse_whitespace(value)
        if len(value) < c.NAME_MIN:
            raise serializers.ValidationError("Zadajte meno a priezvisko.")
        return value

    def validate_email(self, value: str) -> str:
        return value.strip().lower()

    def validate_phone(self, value: str) -> str:
        value = value.strip()
        if value and not PHONE_RE.match(value):
            raise serializers.ValidationError("Zadajte platné telefónne číslo.")
        return value

    def validate_location(self, value: str) -> str:
        return _collapse_whitespace(value)

    def validate_message(self, value: str) -> str:
        value = value.strip()
        if len(value) < c.MESSAGE_MIN:
            raise serializers.ValidationError(
                f"Správa musí mať aspoň {c.MESSAGE_MIN} znakov."
            )
        return value

    def validate_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError(self.error_messages["consent"])
        return value

    @property
    def is_spam(self) -> bool:
        return bool(self.validated_data.get("website"))

    def create(self, validated_data: dict) -> Inquiry:
        validated_data.pop("website", None)
        return super().create(validated_data)
