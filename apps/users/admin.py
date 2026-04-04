"""
Admin configuration for users app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, StartupProfile, TesterProfile


@admin.action(description="Approve selected users")
def approve_users(modeladmin, request, queryset):
    queryset.update(is_approved=True)


@admin.action(description="Ban selected users")
def ban_users(modeladmin, request, queryset):
    queryset.update(is_banned=True)


@admin.action(description="Unban selected users")
def unban_users(modeladmin, request, queryset):
    queryset.update(is_banned=False)


class StartupProfileInline(admin.StackedInline):
    model = StartupProfile
    can_delete = False
    extra = 0


class TesterProfileInline(admin.StackedInline):
    model = TesterProfile
    can_delete = False
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["email", "role", "is_approved", "is_banned", "is_active", "is_staff", "date_joined"]
    list_filter = ["role", "is_approved", "is_banned", "is_active", "is_staff"]
    search_fields = ["email"]
    actions = [approve_users, ban_users, unban_users]
    readonly_fields = ["date_joined", "last_login"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Role & Status"), {"fields": ("role", "is_approved", "is_banned")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "role", "is_approved"),
            },
        ),
    )

    def get_inlines(self, request, obj):
        if obj is None:
            return []
        if obj.role == User.Role.STARTUP:
            return [StartupProfileInline]
        if obj.role == User.Role.TESTER:
            return [TesterProfileInline]
        return []


@admin.register(StartupProfile)
class StartupProfileAdmin(admin.ModelAdmin):
    list_display = ["company_name", "user", "website"]
    search_fields = ["company_name", "user__email"]
    raw_id_fields = ["user"]


@admin.register(TesterProfile)
class TesterProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "experience_level", "reputation_score"]
    list_filter = ["experience_level"]
    search_fields = ["user__email"]
    raw_id_fields = ["user"]
