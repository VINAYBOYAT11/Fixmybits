"""Tester-facing URL routes."""
from django.urls import path
from apps.projects.views import (
    TesterProfileView,
    TesterOpenProjectsView,
    TesterProjectDetailView,
    TesterApplyView,
    TesterAssignedProjectsView,
    TesterSubmitReportView,
    TesterReportsView,
    TesterReportDetailView,
    TesterCancelApplicationView,
)

urlpatterns = [
    # Profile
    path("profile/", TesterProfileView.as_view(), name="tester-profile"),
    # Projects
    path("projects/open/", TesterOpenProjectsView.as_view(), name="tester-open-projects"),
    path("projects/open/<uuid:pk>/", TesterProjectDetailView.as_view(), name="tester-project-detail"),
    path("projects/assigned/", TesterAssignedProjectsView.as_view(), name="tester-assigned-projects"),
    path("projects/<uuid:pk>/apply/", TesterApplyView.as_view(), name="tester-apply"),
    path("projects/<uuid:pk>/reports/", TesterSubmitReportView.as_view(), name="tester-submit-report"),
    # Reports
    path("reports/", TesterReportsView.as_view(), name="tester-reports"),
    path("reports/<uuid:pk>/", TesterReportDetailView.as_view(), name="tester-report-detail"),
    # Applications
    path("applications/<uuid:pk>/", TesterCancelApplicationView.as_view(), name="tester-cancel-application"),
]
