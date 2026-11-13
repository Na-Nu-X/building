from django.contrib import admin, messages
from django.db.models import QuerySet
from django.http import HttpRequest
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import ChoicesCheckboxFilter, RangeDateFilter
from unfold.decorators import action, display

from .models import Inquiry

STATUS_LABELS = {
    Inquiry.Status.NEW.label: "danger",
    Inquiry.Status.IN_PROGRESS.label: "warning",
    Inquiry.Status.QUOTED.label: "info",
    Inquiry.Status.CLOSED.label: "success",
    Inquiry.Status.SPAM.label: "",
}


def new_inquiries_badge(request: HttpRequest) -> str:
    """Sidebar badge: number of unprocessed inquiries (empty when none)."""
    count = Inquiry.objects.filter(status=Inquiry.Status.NEW).count()
    return str(count) if count else ""


@admin.register(Inquiry)
class InquiryAdmin(ModelAdmin):
    list_display = ["sender", "contact", "service", "status_label", "created_at"]
    list_filter = [("status", ChoicesCheckboxFilter), "service", ("created_at", RangeDateFilter)]
    list_filter_submit = True
    list_select_related = ["service"]
    search_fields = ["name", "email", "phone", "message", "location"]
    date_hierarchy = "created_at"
    list_per_page = 50
    actions = ["mark_in_progress", "mark_quoted", "mark_closed", "mark_spam"]
    readonly_fields = [
        "name",
        "email_link",
        "phone_link",
        "service",
        "location",
        "message_text",
        "consent",
        "created_at",
        "updated_at",
        "ip_address",
        "user_agent",
        "notified_at",
    ]
    fieldsets = [
        ("Zákazník", {"fields": ["name", ("email_link", "phone_link"), "location"]}),
        ("Dopyt", {"fields": ["service", "message_text", "consent", "created_at"]}),
        ("Spracovanie", {"fields": ["status", "internal_note"]}),
        (
            "Technické údaje",
            {"classes": ["collapse"], "fields": ["ip_address", "user_agent", "notified_at", "updated_at"]},
        ),
    ]

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False  # inquiries only come from the website form

    @display(description="Odosielateľ", header=True, ordering="name")
    def sender(self, obj: Inquiry):
        return obj.name, obj.location or "—"

    @display(description="Kontakt")
    def contact(self, obj: Inquiry):
        phone = format_html(' · <a href="tel:{}">{}</a>', obj.phone, obj.phone) if obj.phone else ""
        return format_html('<a href="mailto:{}">{}</a>{}', obj.email, obj.email, phone)

    @display(description="Stav", label=STATUS_LABELS, ordering="status")
    def status_label(self, obj: Inquiry) -> str:
        return obj.get_status_display()

    @display(description="E-mail")
    def email_link(self, obj: Inquiry):
        return format_html('<a href="mailto:{}?subject=Re: dopyt z webu">{}</a>', obj.email, obj.email)

    @display(description="Telefón")
    def phone_link(self, obj: Inquiry):
        return format_html('<a href="tel:{}">{}</a>', obj.phone, obj.phone) if obj.phone else "–"

    @display(description="Správa")
    def message_text(self, obj: Inquiry):
        return format_html('<div style="white-space:pre-line;max-width:72ch;line-height:1.6">{}</div>', obj.message)

    def _set_status(self, request: HttpRequest, queryset: QuerySet, status: Inquiry.Status) -> None:
        updated = queryset.update(status=status)
        self.message_user(request, f"Stav „{status.label}“ nastavený pre {updated} dopyt(ov).", messages.SUCCESS)

    @action(description="Označiť ako „Rieši sa“")
    def mark_in_progress(self, request, queryset):
        self._set_status(request, queryset, Inquiry.Status.IN_PROGRESS)

    @action(description="Označiť ako „Odoslaná ponuka“")
    def mark_quoted(self, request, queryset):
        self._set_status(request, queryset, Inquiry.Status.QUOTED)

    @action(description="Označiť ako „Uzavretá“")
    def mark_closed(self, request, queryset):
        self._set_status(request, queryset, Inquiry.Status.CLOSED)

    @action(description="Označiť ako spam")
    def mark_spam(self, request, queryset):
        self._set_status(request, queryset, Inquiry.Status.SPAM)
