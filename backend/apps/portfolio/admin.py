from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline

from .models import Project, ProjectCategory, ProjectImage


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(ModelAdmin):
    list_display = ["name", "slug", "order"]
    list_editable = ["order"]
    prepopulated_fields = {"slug": ["name"]}


class ProjectImageInline(TabularInline):
    model = ProjectImage
    extra = 1
    fields = ["image", "alt", "caption", "is_cover", "order"]


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = ["title", "category", "location", "completed_on", "is_featured", "is_published"]
    list_editable = ["is_featured", "is_published"]
    list_filter = ["category", "is_published", "is_featured"]
    search_fields = ["title", "location", "summary", "description"]
    prepopulated_fields = {"slug": ["title"]}
    date_hierarchy = "completed_on"
    inlines = [ProjectImageInline]
