"""
Serializers for the reports app.
"""
from urllib.parse import urlparse

from rest_framework import serializers

from .models import Report

MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024  # 5 MB


def validate_screenshot_size(image):
    """Shared validator: reject screenshots larger than 5 MB."""
    if image and hasattr(image, "size") and image.size > MAX_SCREENSHOT_BYTES:
        raise serializers.ValidationError(
            f"Screenshot must be smaller than 5 MB (uploaded: {image.size // 1024 // 1024} MB)."
        )
    return image


def validate_google_drive_link(url):
    """Shared validator: only allow drive.google.com URLs."""
    if url:
        hostname = urlparse(url).hostname or ""
        if hostname not in ("drive.google.com", "docs.google.com"):
            raise serializers.ValidationError(
                "Only Google Drive links (drive.google.com) are accepted."
            )
    return url


class ReportSerializer(serializers.ModelSerializer):
    """Full report serializer (read)."""

    screenshot_url = serializers.SerializerMethodField()
    tester_email = serializers.EmailField(source="tester.email", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "project",
            "project_name",
            "tester",
            "tester_email",
            "title",
            "description",
            "steps_to_reproduce",
            "severity",
            "screenshot",
            "screenshot_url",
            "drive_link",
            "status",
            "admin_feedback",
            "submitted_at",
        ]
        read_only_fields = [
            "id", "project", "project_name", "tester", "tester_email",
            "status", "admin_feedback", "submitted_at", "screenshot_url",
        ]

    def get_screenshot_url(self, obj):
        return obj.screenshot_url


class ReportCreateSerializer(serializers.ModelSerializer):
    """Used when a tester submits a new report (multipart for screenshot)."""

    class Meta:
        model = Report
        fields = [
            "title",
            "description",
            "steps_to_reproduce",
            "severity",
            "screenshot",
            "drive_link",
        ]

    def validate_screenshot(self, value):
        return validate_screenshot_size(value)

    def validate_drive_link(self, value):
        return validate_google_drive_link(value)

    def validate(self, attrs):
        if not attrs.get("screenshot") and not attrs.get("drive_link"):
            raise serializers.ValidationError(
                "You must provide either a screenshot upload or a Google Drive link."
            )
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        project = self.context["project"]
        return Report.objects.create(
            project=project,
            tester=request.user,
            **validated_data,
        )


class AdminReviewSerializer(serializers.Serializer):
    """Used by admin to review a report."""

    ACTION_CHOICES = ["approve", "spam", "duplicate"]

    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    feedback = serializers.CharField(required=False, allow_blank=True, default="")


class ReportUpdateSerializer(serializers.ModelSerializer):
    """Used by a tester to edit a report that is still pending_admin_review."""

    class Meta:
        model = Report
        fields = [
            "title",
            "description",
            "steps_to_reproduce",
            "severity",
            "screenshot",
            "drive_link",
        ]
        extra_kwargs = {"screenshot": {"required": False, "allow_null": True}}

    def validate_screenshot(self, value):
        return validate_screenshot_size(value)

    def validate_drive_link(self, value):
        return validate_google_drive_link(value)
