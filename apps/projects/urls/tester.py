"""Tester-facing URL routes."""
from django.urls import path
from apps.projects.views import (
    TesterProfileView,
    TesterOpenProjectsView,
    TesterApplyView,
    TesterAssignedProjectsView,
    TesterSubmitReportView,
    TesterReportsView,
)

urlpatterns = [
    path("profile/", TesterProfileView.as_view(), name="tester-profile"),
    path("projects/open/", TesterOpenProjectsView.as_view(), name="tester-open-projects"),
    path("projects/assigned/", TesterAssignedProjectsView.as_view(), name="tester-assigned-projects"),
    path("projects/<uuid:pk>/apply/", TesterApplyView.as_view(), name="tester-apply"),
    path("projects/<uuid:pk>/reports/", TesterSubmitReportView.as_view(), name="tester-submit-report"),
    path("reports/", TesterReportsView.as_view(), name="tester-reports"),
]
