import io

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.portfolio.models import Project, ProjectImage
from apps.services.models import Service

from .images import validate_image_file
from .models import Guarantee, Stat
from .testing import MediaTestCase, make_image


class ValidateImageFileTests(MediaTestCase):
    def test_accepts_jpeg(self):
        validate_image_file(make_image())

    def test_rejects_non_image(self):
        with self.assertRaises(ValidationError):
            validate_image_file(SimpleUploadedFile("x.jpg", b"not an image"))

    def test_rejects_unsupported_format(self):
        with self.assertRaises(ValidationError):
            validate_image_file(make_image("x.gif", (10, 10), fmt="GIF"))

    @override_settings(MAX_UPLOAD_IMAGE_SIZE=100)
    def test_rejects_oversized_file(self):
        with self.assertRaises(ValidationError):
            validate_image_file(make_image())


class AboutApiTests(APITestCase):
    def test_returns_only_published_items_in_order(self):
        Stat.objects.create(value=10, suffix="+", label="B", order=2)
        Stat.objects.create(value=5, label="A", order=1)
        Stat.objects.create(value=1, label="Skryté", is_published=False)
        Guarantee.objects.create(title="Záruka", text="Text")

        response = self.client.get(reverse("api:about"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual([s["label"] for s in response.data["stats"]], ["A", "B"])
        self.assertEqual(len(response.data["guarantees"]), 1)
        self.assertEqual(response.data["certifications"], [])
        self.assertEqual(response.data["team"], [])


class SeedDemoCommandTests(MediaTestCase):
    def test_seed_is_idempotent(self):
        call_command("seed_demo", images=1, stdout=io.StringIO())
        call_command("seed_demo", images=1, stdout=io.StringIO())
        self.assertEqual(Service.objects.count(), 6)
        self.assertEqual(Project.objects.count(), 9)
        self.assertEqual(ProjectImage.objects.count(), 9)
