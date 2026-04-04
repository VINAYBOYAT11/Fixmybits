"""Admin-facing URL routes."""
from django.urls import path
from apps.projects.views import (
    AdminPendingUsersView,
    AdminApproveUserView,
    AdminPendingProjectsView,
    AdminApproveProjectView,
    AdminAvailableTestersView,
    AdminAssignTesterView,
    AdminPendingReportsView,
    AdminReviewReportView,
)

urlpatterns = [
    path("pending-users/", AdminPendingUsersView.as_view(), name="admin-pending-users"),
    path("users/<uuid:pk>/approve/", AdminApproveUserView.as_view(), name="admin-approve-user"),
    path("pending-projects/", AdminPendingProjectsView.as_view(), name="admin-pending-projects"),
    path("projects/<uuid:pk>/approve/", AdminApproveProjectView.as_view(), name="admin-approve-project"),
    path("available-testers/", AdminAvailableTestersView.as_view(), name="admin-available-testers"),
    path("projects/<uuid:pk>/assign/", AdminAssignTesterView.as_view(), name="admin-assign-tester"),
    path("pending-reports/", AdminPendingReportsView.as_view(), name="admin-pending-reports"),
    path("reports/<uuid:pk>/review/", AdminReviewReportView.as_view(), name="admin-review-report"),
]
