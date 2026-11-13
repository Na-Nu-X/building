from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Service, ServiceFeature


class ServiceApiTests(APITestCase):
    def setUp(self):
        self.service = Service.objects.create(
            title="Obkladanie a dlažby",
            short_description="Popis",
            price_from=Decimal("28.50"),
            order=1,
        )
        ServiceFeature.objects.create(service=self.service, text="Druhý", order=2)
        ServiceFeature.objects.create(service=self.service, text="Prvý", order=1)
        Service.objects.create(title="Skrytá", short_description="x", is_published=False)

    def test_slug_is_generated_from_slovak_title(self):
        self.assertEqual(self.service.slug, "obkladanie-a-dlazby")

    def test_list_returns_published_services_with_ordered_features(self):
        response = self.client.get(reverse("api:service-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        item = response.data[0]
        self.assertEqual(item["features"], ["Prvý", "Druhý"])
        self.assertEqual(item["price_from"], 28.5)
        self.assertEqual(item["price_unit_display"], "€ / m²")

    def test_detail_by_slug(self):
        response = self.client.get(reverse("api:service-detail", args=["obkladanie-a-dlazby"]))
        self.assertEqual(response.status_code, 200)

    def test_unpublished_detail_is_404(self):
        response = self.client.get(reverse("api:service-detail", args=["skryta"]))
        self.assertEqual(response.status_code, 404)

    def test_api_is_read_only(self):
        response = self.client.post(reverse("api:service-list"), {"title": "x"}, format="json")
        self.assertEqual(response.status_code, 405)
