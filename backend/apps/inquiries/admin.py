from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(ModelAdmin):
    list_display = ["name", "email", "phone", "service", "status", "created_at"]
    list_filter = ["status", "service", "created_at"]
    list_editable = ["status"]
    search_fields = ["name", "email", "phone", "message", "location"]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at", "updated_at", "ip_address", "user_agent", "notified_at"]
