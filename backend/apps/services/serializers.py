from rest_framework import serializers

from apps.core.serializers import AbsoluteImageField

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    image = AbsoluteImageField()
    features = serializers.SerializerMethodField()
    price_unit_display = serializers.CharField(source="get_price_unit_display", read_only=True)

    class Meta:
        model = Service
        fields = [
            "id",
            "slug",
            "title",
            "icon",
            "short_description",
            "description",
            "image",
            "features",
            "price_from",
            "price_unit",
            "price_unit_display",
            "is_featured",
        ]

    def get_features(self, obj: Service) -> list[str]:
        return [feature.text for feature in obj.features.all()]
