from django.contrib import admin
from django.db.models import Count
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import RangeDateFilter
from unfold.decorators import display

from apps.core.admin_utils import image_preview

from .models import Project, ProjectCategory, ProjectImage


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(ModelAdmin):
    list_display = ["name", "slug", "project_count"]
    prepopulated_fields = {"slug": ["name"]}
    ordering_field = "order"
    hide_ordering_field = True
    search_fields = ["name"]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_project_count=Count("projects"))

    @display(description="Projekty", ordering="_project_count")
    def project_count(self, obj: ProjectCategory) -> int:
        return obj._project_count


class ProjectImageInline(TabularInline):
    model = ProjectImage
    extra = 0
    fields = ["preview", "image", "alt", "caption", "is_cover", "order"]
    readonly_fields = ["preview"]
    ordering_field = "order"
    hide_ordering_field = True
    tab = True

    @display(description="Náhľad")
    def preview(self, obj: ProjectImage):
        return image_preview(obj.thumbnail.url if obj.thumbnail else None, height=64, width=110, alt=obj.alt)


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = [
        "cover_preview",
        "title",
        "category",
        "location",
        "completed_on",
        "photo_count",
        "is_featured",
        "is_published",
    ]
    list_display_links = ["cover_preview", "title"]
    list_filter = ["category", "is_published", "is_featured", ("completed_on", RangeDateFilter)]
    list_filter_submit = True
    search_fields = ["title", "location", "summary", "description"]
    prepopulated_fields = {"slug": ["title"]}
    ordering_field = "order"
    hide_ordering_field = True
    list_select_related = ["category"]
    inlines = [ProjectImageInline]
    fieldsets = [
        (None, {"fields": ["title", "slug", "category", "summary", "description"]}),
        ("Detaily realizácie", {"fields": [("location", "completed_on"), ("area_m2", "duration_weeks")]}),
        ("Zobrazenie", {"fields": [("is_published", "is_featured")]}),
    ]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .annotate(_photo_count=Count("images"))
            .prefetch_related("images")
        )

    @display(description="Titulka")
    def cover_preview(self, obj: Project):
        cover = obj.cover
        return image_preview(cover.thumbnail.url if cover and cover.thumbnail else None, height=48, width=72)

    @display(description="Fotky", ordering="_photo_count")
    def photo_count(self, obj: Project) -> int:
        return obj._photo_count
