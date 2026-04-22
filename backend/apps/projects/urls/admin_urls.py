"""Admin-facing URL routes."""
from django.urls import path
from apps.projects.views import (
    AdminPendingUsersView,
    AdminApproveUserView,
    AdminBanUserView,
    AdminPendingProjectsView,
    AdminApproveProjectView,
    AdminProjectRejectView,
    AdminProjectReopenView,
    AdminAvailableTestersView,
    AdminAssignTesterView,
    AdminPendingReportsView,
    AdminReviewReportView,
    AdminStatsView,
    AdminApplicationListView,
    AdminApplicationAcceptView,
    AdminApplicationRejectView,
)

urlpatterns = [
    # Stats
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    # Users
    path("pending-users/", AdminPendingUsersView.as_view(), name="admin-pending-users"),
    path("users/<uuid:pk>/approve/", AdminApproveUserView.as_view(), name="admin-approve-user"),
    path("users/<uuid:pk>/ban/", AdminBanUserView.as_view(), name="admin-ban-user"),
    # Projects
    path("pending-projects/", AdminPendingProjectsView.as_view(), name="admin-pending-projects"),
    path("projects/<uuid:pk>/approve/", AdminApproveProjectView.as_view(), name="admin-approve-project"),
    path("projects/<uuid:pk>/reject/", AdminProjectRejectView.as_view(), name="admin-reject-project"),
    path("projects/<uuid:pk>/reopen/", AdminProjectReopenView.as_view(), name="admin-reopen-project"),
    path("projects/<uuid:pk>/assign/", AdminAssignTesterView.as_view(), name="admin-assign-tester"),
    # Testers
    path("available-testers/", AdminAvailableTestersView.as_view(), name="admin-available-testers"),
    # Reports
    path("pending-reports/", AdminPendingReportsView.as_view(), name="admin-pending-reports"),
    path("reports/<uuid:pk>/review/", AdminReviewReportView.as_view(), name="admin-review-report"),
    # Applications
    path("applications/", AdminApplicationListView.as_view(), name="admin-applications"),
    path("applications/<uuid:pk>/accept/", AdminApplicationAcceptView.as_view(), name="admin-accept-application"),
    path("applications/<uuid:pk>/reject/", AdminApplicationRejectView.as_view(), name="admin-reject-application"),
]
