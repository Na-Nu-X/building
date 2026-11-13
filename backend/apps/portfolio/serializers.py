from rest_framework import serializers

from apps.core.serializers import AbsoluteImageField

from .models import Project, ProjectCategory, ProjectImage


class ProjectCategorySerializer(serializers.ModelSerializer):
    project_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProjectCategory
        fields = ["id", "slug", "name", "project_count"]


class ProjectCategoryRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ["id", "slug", "name"]


class ProjectImageSerializer(serializers.ModelSerializer):
    original = AbsoluteImageField(source="image")
    thumbnail = AbsoluteImageField()
    large = AbsoluteImageField()

    class Meta:
        model = ProjectImage
        fields = ["id", "thumbnail", "large", "original", "width", "height", "alt", "caption", "is_cover"]


class ProjectSerializer(serializers.ModelSerializer):
    category = ProjectCategoryRefSerializer(read_only=True)
    cover = ProjectImageSerializer(read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "slug",
            "title",
            "category",
            "location",
            "completed_on",
            "summary",
            "description",
            "area_m2",
            "duration_weeks",
            "is_featured",
            "cover",
            "images",
        ]
