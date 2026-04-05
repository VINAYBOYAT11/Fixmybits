"""
User models for FixMyBits.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager for User model with email as username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email address is required.")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_approved", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model using email as the primary identifier."""

    class Role(models.TextChoices):
        STARTUP = "startup", "Startup"
        TESTER = "tester", "Tester"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.TESTER)
    is_approved = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_startup(self):
        return self.role == self.Role.STARTUP

    @property
    def is_tester(self):
        return self.role == self.Role.TESTER

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN


class StartupProfile(models.Model):
    """Extended profile for startup users."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="startup_profile"
    )
    company_name = models.CharField(max_length=255)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to="startup/logos/", null=True, blank=True)

    class Meta:
        verbose_name = "Startup Profile"
        verbose_name_plural = "Startup Profiles"

    def __str__(self):
        return f"{self.company_name} ({self.user.email})"


class TesterProfile(models.Model):
    """Extended profile for tester users."""

    class ExperienceLevel(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="tester_profile"
    )
    skills = models.JSONField(default=list, blank=True)
    tools = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(
        max_length=20,
        choices=ExperienceLevel.choices,
        default=ExperienceLevel.BEGINNER,
    )
    bio = models.TextField(blank=True)
    reputation_score = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Tester Profile"
        verbose_name_plural = "Tester Profiles"

    def __str__(self):
        return f"{self.user.email} – {self.get_experience_level_display()}"
