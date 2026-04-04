"""
Admin configuration for reports app.
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Report


@admin.action(description="Approve selected reports")
def approve_reports(modeladmin, request, queryset):
    queryset.filter(status=Report.Status.PENDING_ADMIN_REVIEW).update(
        status=Report.Status.APPROVED
    )


@admin.action(description="Mark selected reports as Spam")
def spam_reports(modeladmin, request, queryset):
    queryset.filter(status=Report.Status.PENDING_ADMIN_REVIEW).update(
        status=Report.Status.SPAM
    )


@admin.action(description="Mark selected reports as Duplicate")
def duplicate_reports(modeladmin, request, queryset):
    queryset.filter(status=Report.Status.PENDING_ADMIN_REVIEW).update(
        status=Report.Status.DUPLICATE
    )


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "project",
        "tester",
        "severity_badge",
        "status_badge",
        "submitted_at",
    ]
    list_filter = ["status", "severity"]
    search_fields = ["title", "tester__email", "project__name"]
    raw_id_fields = ["tester", "project"]
    readonly_fields = ["submitted_at", "screenshot_preview"]
    actions = [approve_reports, spam_reports, duplicate_reports]

    fieldsets = (
        ("Report Details", {
            "fields": ("project", "tester", "title", "description", "steps_to_reproduce", "severity")
        }),
        ("Screenshot", {
            "fields": ("screenshot", "screenshot_preview")
        }),
        ("Moderation", {
            "fields": ("status", "admin_feedback")
        }),
        ("Metadata", {
            "fields": ("submitted_at",)
        }),
    )

    def severity_badge(self, obj):
        color_map = {"Low": "green", "Medium": "orange", "High": "red", "Critical": "darkred"}
        color = color_map.get(obj.severity, "gray")
        return format_html(
            '<span style="color: white; background: {}; padding: 2px 6px; border-radius: 4px;">{}</span>',
            color, obj.severity,
        )
    severity_badge.short_description = "Severity"

    def status_badge(self, obj):
        color_map = {
            "pending_admin_review": "orange",
            "approved": "green",
            "spam": "gray",
            "duplicate": "purple",
            "fixed": "teal",
        }
        color = color_map.get(obj.status, "black")
        return format_html(
            '<span style="color: white; background: {}; padding: 2px 6px; border-radius: 4px;">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = "Status"

    def screenshot_preview(self, obj):
        if obj.screenshot:
            return format_html('<img src="{}" style="max-height: 200px;" />', obj.screenshot_url)
        return "No screenshot"
    screenshot_preview.short_description = "Screenshot Preview"
