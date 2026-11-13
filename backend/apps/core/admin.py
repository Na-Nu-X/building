from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Certification, Guarantee, Stat, TeamMember


@admin.register(Stat)
class StatAdmin(ModelAdmin):
    list_display = ["label", "value", "suffix", "order", "is_published"]
    list_editable = ["order", "is_published"]


@admin.register(Guarantee)
class GuaranteeAdmin(ModelAdmin):
    list_display = ["title", "icon", "order", "is_published"]
    list_editable = ["order", "is_published"]
    search_fields = ["title", "text"]


@admin.register(Certification)
class CertificationAdmin(ModelAdmin):
    list_display = ["name", "issuer", "year", "order", "is_published"]
    list_editable = ["order", "is_published"]
    search_fields = ["name", "issuer"]


@admin.register(TeamMember)
class TeamMemberAdmin(ModelAdmin):
    list_display = ["name", "role", "order", "is_published"]
    list_editable = ["order", "is_published"]
    search_fields = ["name", "role"]
