"""
Serializers for the projects app.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Application, Project
from apps.users.serializers import UserSerializer, TesterProfileSerializer

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    """Full project serializer for startup owners."""

    startup_email = serializers.EmailField(source="startup.email", read_only=True)
    assigned_tester_email = serializers.EmailField(
        source="assigned_tester.email", read_only=True
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "startup",
            "startup_email",
            "name",
            "in_scope",
            "out_of_scope",
            "testing_rules",
            "status",
            "assigned_tester",
            "assigned_tester_email",
            "rejection_reason",
            "created_at",
        ]
        read_only_fields = [
            "id", "startup", "startup_email", "status",
            "assigned_tester", "assigned_tester_email",
            "rejection_reason", "created_at",
        ]


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/editing projects (startup only)."""

    class Meta:
        model = Project
        fields = ["id", "name", "in_scope", "out_of_scope", "testing_rules"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        validated_data["startup"] = self.context["request"].user
        validated_data["status"] = Project.Status.DRAFT
        return super().create(validated_data)


class OpenProjectSerializer(serializers.ModelSerializer):
    """Minimal project info visible to testers browsing open projects."""

    startup_company = serializers.CharField(
        source="startup.startup_profile.company_name", read_only=True
    )
    has_applied = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "startup_company",
            "in_scope",
            "out_of_scope",
            "testing_rules",
            "status",
            "has_applied",
            "created_at",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    """Tester application details."""

    project_name = serializers.CharField(source="project.name", read_only=True)
    tester_email = serializers.EmailField(source="tester.email", read_only=True)

    class Meta:
        model = Application
        fields = ["id", "project", "project_name", "tester", "tester_email", "status", "applied_at"]
        read_only_fields = ["id", "tester", "tester_email", "status", "applied_at"]


class TesterNestedSerializer(serializers.Serializer):
    """Nested tester info used in ApplicationListSerializer."""
    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    tester_profile = TesterProfileSerializer(read_only=True)


class ApplicationListSerializer(serializers.ModelSerializer):
    """
    Rich application serializer for admin / startup to list applications
    with full tester details.
    """
    project_name = serializers.CharField(source="project.name", read_only=True)
    tester = TesterNestedSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "project", "project_name", "tester", "status", "applied_at"]
        read_only_fields = fields


class AssignTesterSerializer(serializers.Serializer):
    """Admin uses this to assign a tester to a project."""

    tester_id = serializers.UUIDField()
    application_id = serializers.UUIDField(required=False, allow_null=True)

    def validate_tester_id(self, value):
        try:
            user = User.objects.get(id=value, role="tester", is_approved=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("Approved tester with this ID does not exist.")
        return user

    def validate_application_id(self, value):
        if value is None:
            return None
        try:
            return Application.objects.get(id=value)
        except Application.DoesNotExist:
            raise serializers.ValidationError("Application with this ID does not exist.")


class ProjectRejectSerializer(serializers.Serializer):
    """Admin uses this to reject a project with an optional reason."""
    reason = serializers.CharField(required=False, allow_blank=True, default="")
