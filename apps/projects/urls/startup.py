"""Startup-facing URL routes."""
from django.urls import path
from apps.projects.views import (
    StartupProjectListCreateView,
    StartupProjectDetailView,
    StartupProjectReportsView,
    StartupMarkReportFixedView,
)

urlpatterns = [
    path("projects/", StartupProjectListCreateView.as_view(), name="startup-projects"),
    path("projects/<uuid:pk>/", StartupProjectDetailView.as_view(), name="startup-project-detail"),
    path("projects/<uuid:pk>/reports/", StartupProjectReportsView.as_view(), name="startup-project-reports"),
    path("reports/<uuid:pk>/mark_fixed/", StartupMarkReportFixedView.as_view(), name="startup-mark-report-fixed"),
]
