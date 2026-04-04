"""
Admin configuration for projects app.
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Application, Project


@admin.action(description="Approve selected projects (set to Open)")
def approve_projects(modeladmin, request, queryset):
    queryset.filter(status=Project.Status.PENDING_APPROVAL).update(status=Project.Status.OPEN)


@admin.action(description="Reject selected projects")
def reject_projects(modeladmin, request, queryset):
    queryset.filter(status=Project.Status.PENDING_APPROVAL).update(status=Project.Status.REJECTED)


class ApplicationInline(admin.TabularInline):
    model = Application
    extra = 0
    readonly_fields = ["tester", "status", "applied_at"]
    can_delete = False


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "startup",
        "status_badge",
        "assigned_tester",
        "created_at",
    ]
    list_filter = ["status"]
    search_fields = ["name", "startup__email"]
    raw_id_fields = ["startup", "assigned_tester"]
    readonly_fields = ["created_at"]
    inlines = [ApplicationInline]
    actions = [approve_projects, reject_projects]

    def status_badge(self, obj):
        color_map = {
            "draft": "gray",
            "pending_approval": "orange",
            "open": "green",
            "in_progress": "blue",
            "completed": "teal",
            "rejected": "red",
        }
        color = color_map.get(obj.status, "black")
        return format_html(
            '<span style="color: white; background: {}; padding: 2px 8px; border-radius: 4px;">{}</span>',
            color,
            obj.get_status_display(),
        )

    status_badge.short_description = "Status"


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["tester", "project", "status", "applied_at"]
    list_filter = ["status"]
    search_fields = ["tester__email", "project__name"]
    raw_id_fields = ["tester", "project"]
    readonly_fields = ["applied_at"]
