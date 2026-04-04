"""
Report permissions.
"""
from rest_framework.permissions import BasePermission


class IsReportOwner(BasePermission):
    """Only the tester who submitted the report can edit it."""

    def has_object_permission(self, request, view, obj):
        return obj.tester == request.user
