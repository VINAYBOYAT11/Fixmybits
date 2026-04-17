"""URL patterns for the reports app."""
from django.urls import path
from .views import ReportMessageListCreateView

urlpatterns = [
    path("<uuid:report_id>/messages/", ReportMessageListCreateView.as_view(), name="report-messages"),
]
