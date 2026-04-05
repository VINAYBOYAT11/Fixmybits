"""Startup-facing URL routes."""
from django.urls import path
from apps.projects.views import (
    StartupProjectListCreateView,
    StartupProjectDetailView,
    StartupProjectSubmitView,
    StartupProjectCompleteView,
    StartupProjectReportsView,
    StartupMarkReportFixedView,
    StartupProjectApplicationsView,
    StartupProfileView,
)

urlpatterns = [
    # Profile
    path("profile/", StartupProfileView.as_view(), name="startup-profile"),
    # Projects
    path("projects/", StartupProjectListCreateView.as_view(), name="startup-projects"),
    path("projects/<uuid:pk>/", StartupProjectDetailView.as_view(), name="startup-project-detail"),
    path("projects/<uuid:pk>/submit/", StartupProjectSubmitView.as_view(), name="startup-project-submit"),
    path("projects/<uuid:pk>/complete/", StartupProjectCompleteView.as_view(), name="startup-project-complete"),
    path("projects/<uuid:pk>/reports/", StartupProjectReportsView.as_view(), name="startup-project-reports"),
    path("projects/<uuid:pk>/applications/", StartupProjectApplicationsView.as_view(), name="startup-project-applications"),
    # Reports
    path("reports/<uuid:pk>/mark_fixed/", StartupMarkReportFixedView.as_view(), name="startup-mark-report-fixed"),
]
