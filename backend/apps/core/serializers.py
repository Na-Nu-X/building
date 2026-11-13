from rest_framework import serializers

from .models import Certification, Guarantee, Stat, TeamMember


class AbsoluteImageField(serializers.ImageField):
    """Read-only image field that always renders an absolute URL (or null)."""

    def __init__(self, **kwargs):
        kwargs.setdefault("read_only", True)
        super().__init__(**kwargs)

    def to_representation(self, value):
        if not value:
            return None
        request = self.context.get("request")
        url = value.url
        return request.build_absolute_uri(url) if request else url


class StatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stat
        fields = ["id", "value", "suffix", "label"]


class GuaranteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guarantee
        fields = ["id", "icon", "title", "text"]


class CertificationSerializer(serializers.ModelSerializer):
    logo = AbsoluteImageField()

    class Meta:
        model = Certification
        fields = ["id", "name", "issuer", "year", "logo"]


class TeamMemberSerializer(serializers.ModelSerializer):
    photo = AbsoluteImageField()

    class Meta:
        model = TeamMember
        fields = ["id", "name", "role", "bio", "photo"]
