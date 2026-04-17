"""
Serializers for the users app.
"""
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import StartupProfile, TesterProfile

User = get_user_model()


class StartupProfileSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StartupProfile
        fields = ["company_name", "website", "logo", "logo_url"]
        extra_kwargs = {"logo": {"required": False, "allow_null": True}}

    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None


# Alias used in profile update endpoint
StartupProfileUpdateSerializer = StartupProfileSerializer



class TesterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TesterProfile
        fields = ["skills", "tools", "experience_level", "bio", "reputation_score"]
        read_only_fields = ["reputation_score"]


class UserSerializer(serializers.ModelSerializer):
    """Read-only user serializer (safe fields only)."""

    startup_profile = StartupProfileSerializer(read_only=True)
    tester_profile = TesterProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "role",
            "is_approved",
            "is_banned",
            "date_joined",
            "startup_profile",
            "tester_profile",
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """Handles user registration with role-specific profile creation."""

    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    confirm_password = serializers.CharField(write_only=True, style={"input_type": "password"})

    # Startup-specific fields (optional)
    company_name = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)

    # Tester-specific fields (optional)
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    tools = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    experience_level = serializers.ChoiceField(
        choices=TesterProfile.ExperienceLevel.choices,
        required=False,
        default=TesterProfile.ExperienceLevel.BEGINNER,
    )
    bio = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "confirm_password",
            "role",
            "company_name",
            "website",
            "skills",
            "tools",
            "experience_level",
            "bio",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        role = attrs.get("role")
        if role == User.Role.STARTUP and not attrs.get("company_name"):
            raise serializers.ValidationError(
                {"company_name": "Company name is required for startup accounts."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data["role"]

        # Extract profile-specific fields
        company_name = validated_data.pop("company_name", "")
        website = validated_data.pop("website", "")
        skills = validated_data.pop("skills", [])
        tools = validated_data.pop("tools", [])
        experience_level = validated_data.pop("experience_level", TesterProfile.ExperienceLevel.BEGINNER)
        bio = validated_data.pop("bio", "")

        # All new users are automatically approved.
        # Only admins get staff permissions.
        validated_data["is_approved"] = True
        if role == User.Role.ADMIN:
            validated_data["is_staff"] = True

        user = User.objects.create_user(**validated_data)

        # Create role-specific profile
        if role == User.Role.STARTUP:
            StartupProfile.objects.create(user=user, company_name=company_name, website=website)
        elif role == User.Role.TESTER:
            TesterProfile.objects.create(
                user=user,
                skills=skills,
                tools=tools,
                experience_level=experience_level,
                bio=bio,
            )

        return user


class TesterProfileUpdateSerializer(serializers.ModelSerializer):
    """Allow testers to update their profile."""

    class Meta:
        model = TesterProfile
        fields = ["skills", "tools", "experience_level", "bio"]


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    confirm_password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
