"""
Custom permission classes for FixMyBits.
"""
from rest_framework.permissions import BasePermission


class IsStartup(BasePermission):
    """Allow access only to approved startup users."""

    message = "Access restricted to approved startup accounts."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "startup"
            and request.user.is_approved
            and not request.user.is_banned
        )


class IsTester(BasePermission):
    """Allow access only to approved tester users."""

    message = "Access restricted to approved tester accounts."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "tester"
            and request.user.is_approved
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
    """Allow access to any approved, non-banned user."""

    message = "Your account is not yet approved or has been banned."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_approved
            and not request.user.is_banned
        )
