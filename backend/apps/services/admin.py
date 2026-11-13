from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline

from .models import Service, ServiceFeature


class ServiceFeatureInline(TabularInline):
    model = ServiceFeature
    extra = 1


@admin.register(Service)
class ServiceAdmin(ModelAdmin):
    list_display = ["title", "price_from", "price_unit", "order", "is_featured", "is_published"]
    list_editable = ["order", "is_featured", "is_published"]
    list_filter = ["is_published", "is_featured"]
    search_fields = ["title", "short_description", "description"]
    prepopulated_fields = {"slug": ["title"]}
    inlines = [ServiceFeatureInline]
