"""
Project and Application models for FixMyBits.
"""
import uuid
from django.conf import settings
from django.db import models


class Project(models.Model):
    """A bug-bounty project created by a startup."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING_APPROVAL = "pending_approval", "Pending Approval"
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    startup = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
        limit_choices_to={"role": "startup"},
    )
    name = models.CharField(max_length=255)
    in_scope = models.TextField()
    out_of_scope = models.TextField(blank=True)
    testing_rules = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    assigned_tester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_projects",
        limit_choices_to={"role": "tester"},
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Project"
        verbose_name_plural = "Projects"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} [{self.get_status_display()}]"


class Application(models.Model):
    """A tester's application to work on a project."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="applications"
    )
    tester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
        limit_choices_to={"role": "tester"},
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Application"
        verbose_name_plural = "Applications"
        ordering = ["-applied_at"]
        unique_together = [["project", "tester"]]

    def __str__(self):
        return f"{self.tester.email} → {self.project.name} ({self.get_status_display()})"
