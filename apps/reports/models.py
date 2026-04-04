"""
Report model for FixMyBits.
"""
import uuid
from django.conf import settings
from django.db import models


class Report(models.Model):
    """A bug report submitted by an assigned tester for a project."""

    class Severity(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"
        CRITICAL = "Critical", "Critical"

    class Status(models.TextChoices):
        PENDING_ADMIN_REVIEW = "pending_admin_review", "Pending Admin Review"
        APPROVED = "approved", "Approved"
        SPAM = "spam", "Spam"
        DUPLICATE = "duplicate", "Duplicate"
        FIXED = "fixed", "Fixed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="reports"
    )
    tester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports",
        limit_choices_to={"role": "tester"},
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    steps_to_reproduce = models.TextField()
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.LOW)
    screenshot = models.ImageField(upload_to="reports/screenshots/", null=True, blank=True)
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.PENDING_ADMIN_REVIEW,
    )
    admin_feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Report"
        verbose_name_plural = "Reports"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"[{self.severity}] {self.title} – {self.project.name}"

    @property
    def screenshot_url(self):
        """Return the URL of the screenshot (works for both Cloudinary and local)."""
        if self.screenshot:
            return self.screenshot.url
        return None
