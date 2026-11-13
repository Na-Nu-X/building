from django.contrib import admin
from django.db.models import Count
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display

from apps.core.admin_utils import image_preview

from .models import Service, ServiceFeature


class ServiceFeatureInline(TabularInline):
    model = ServiceFeature
    extra = 0
    fields = ["text", "order"]
    ordering_field = "order"
    hide_ordering_field = True
    tab = True


@admin.register(Service)
class ServiceAdmin(ModelAdmin):
    list_display = ["image_preview", "title", "price", "feature_count", "is_featured", "is_published"]
    list_display_links = ["image_preview", "title"]
    list_filter = ["is_published", "is_featured"]
    search_fields = ["title", "short_description", "description"]
    prepopulated_fields = {"slug": ["title"]}
    ordering_field = "order"
    hide_ordering_field = True
    inlines = [ServiceFeatureInline]
    fieldsets = [
        (None, {"fields": ["title", "slug", "icon", "short_description", "description", "image"]}),
        ("Cena", {"fields": [("price_from", "price_unit")]}),
        ("Zobrazenie", {"fields": [("is_published", "is_featured")]}),
    ]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_feature_count=Count("features"))

    @display(description="Obrázok")
    def image_preview(self, obj: Service):
        return image_preview(obj.image.url if obj.image else None)

    @display(description="Cena od", ordering="price_from")
    def price(self, obj: Service) -> str:
        if obj.price_from is None:
            return "na vyžiadanie"
        amount = f"{obj.price_from:,.2f}".replace(",", " ").replace(".", ",").removesuffix(",00")
        return f"{amount} {obj.get_price_unit_display()}"

    @display(description="Body", ordering="_feature_count")
    def feature_count(self, obj: Service) -> int:
        return obj._feature_count
