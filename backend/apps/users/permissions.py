"""
Custom permission classes for FixMyBits.
"""
from rest_framework.permissions import BasePermission


class IsStartup(BasePermission):
    """Allow access only to startup users."""

    message = "Access restricted to startup accounts."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "startup"
            and not request.user.is_banned
        )


class IsTester(BasePermission):
    """Allow access only to tester users."""

    message = "Access restricted to tester accounts."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "tester"
            and not request.user.is_banned
        )


class IsAdminRole(BasePermission):
    """Allow access only to admin-role users."""

    message = "Access restricted to admin accounts."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )


class IsApprovedUser(BasePermission):
    """Allow access to any non-banned user."""

    message = "Your account has been banned."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and not request.user.is_banned
        )
