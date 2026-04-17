"""
Serializers for the reports app.
"""
from rest_framework import serializers

from .models import Report, ReportMessage


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


class ReportMessageSerializer(serializers.ModelSerializer):
    """A single chat message on a report."""

    sender_email = serializers.EmailField(source="sender.email", read_only=True)
    sender_role  = serializers.CharField(source="sender.role",  read_only=True)

    class Meta:
        model = ReportMessage
        fields = ["id", "report", "sender", "sender_email", "sender_role", "content", "created_at"]
        read_only_fields = ["id", "report", "sender", "sender_email", "sender_role", "created_at"]

