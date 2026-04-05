"""
Project-related permission classes.
"""
from rest_framework.permissions import BasePermission

from .models import Application, Project


class IsProjectOwner(BasePermission):
    """Only the startup that owns the project may access it."""

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Project):
            return obj.startup == request.user
        return False


class IsAssignedTester(BasePermission):
    """Only the assigned tester can submit reports for a project."""

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Project):
            return obj.assigned_tester == request.user
        return False


class IsReportOwner(BasePermission):
    """Only the tester who submitted the report can edit/delete it."""

    message = "You do not have permission to modify this report."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "tester"

    def has_object_permission(self, request, view, obj):
        from apps.reports.models import Report
        if isinstance(obj, Report):
            return obj.tester == request.user
        return False
