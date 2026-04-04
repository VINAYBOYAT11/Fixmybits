"""
Project-related permission classes.
"""
from rest_framework.permissions import BasePermission

from .models import Project


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
