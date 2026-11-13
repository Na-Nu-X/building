from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group, User
from unfold.admin import ModelAdmin
from unfold.decorators import display
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from .admin_utils import image_preview
from .models import Certification, Guarantee, Stat, TeamMember

# --- Users & groups with Unfold styling --------------------------------------

admin.site.unregister(User)
admin.site.unregister(Group)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


# --- About section content ---------------------------------------------------


class SortableAdmin(ModelAdmin):
    """Drag & drop ordering on the `order` field."""

    ordering_field = "order"
    hide_ordering_field = True
    list_per_page = 100


@admin.register(Stat)
class StatAdmin(SortableAdmin):
    list_display = ["label", "display_value", "is_published"]
    list_filter = ["is_published"]

    @display(description="Hodnota")
    def display_value(self, obj: Stat) -> str:
        return f"{obj.value}{obj.suffix}"


@admin.register(Guarantee)
class GuaranteeAdmin(SortableAdmin):
    list_display = ["title", "text", "is_published"]
    list_filter = ["is_published"]
    search_fields = ["title", "text"]


@admin.register(Certification)
class CertificationAdmin(SortableAdmin):
    list_display = ["logo_preview", "name", "issuer", "year", "is_published"]
    list_display_links = ["logo_preview", "name"]
    list_filter = ["is_published"]
    search_fields = ["name", "issuer"]

    @display(description="Logo")
    def logo_preview(self, obj: Certification):
        return image_preview(obj.logo.url if obj.logo else None, height=36, width=72)


@admin.register(TeamMember)
class TeamMemberAdmin(SortableAdmin):
    list_display = ["photo_preview", "name", "role", "is_published"]
    list_display_links = ["photo_preview", "name"]
    list_filter = ["is_published"]
    search_fields = ["name", "role"]

    @display(description="Foto")
    def photo_preview(self, obj: TeamMember):
        return image_preview(obj.photo.url if obj.photo else None, height=40, width=40)
