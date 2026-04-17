"""
Celery email tasks for FixMyBits.
"""
import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_report_approved_email(self, report_id: str, tester_email: str):
    """
    Notify the tester that their report has been approved by an admin.
    Triggered after admin reviews a report with action='approve'.
    """
    try:
        from apps.reports.models import Report
        report = Report.objects.select_related("project").get(id=report_id)

        subject = f"[FixMyBits] Your report '{report.title}' has been approved!"
        message = f"""
Hi Tester,

Great news! Your bug report has been reviewed and approved by our admin team.

Report Details:
  Title     : {report.title}
  Project   : {report.project.name}
  Severity  : {report.severity}
  Feedback  : {report.admin_feedback or 'No additional feedback.'}

Thank you for contributing to a safer digital world.

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[tester_email],
            fail_silently=False,
        )
        logger.info("Report approved email sent to %s for report %s", tester_email, report_id)

    except Exception as exc:
        logger.error("Failed to send report approved email: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_project_assigned_email(self, project_id: str, tester_email: str, startup_email: str):
    """
    Notify both the tester and startup when a tester is assigned to a project.
    Triggered after admin uses the assign or accept-application endpoint.
    """
    try:
        from apps.projects.models import Project
        project = Project.objects.select_related("startup", "assigned_tester").get(id=project_id)

        # Email to tester
        tester_subject = f"[FixMyBits] You've been assigned to '{project.name}'"
        tester_message = f"""
Hi Tester,

You have been assigned to a new project on FixMyBits!

Project Details:
  Name          : {project.name}
  In Scope      : {project.in_scope}
  Out of Scope  : {project.out_of_scope}

Please log in and start your security assessment. Submit your findings via the portal.

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=tester_subject,
            message=tester_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[tester_email],
            fail_silently=False,
        )

        # Email to startup
        startup_subject = f"[FixMyBits] A tester has been assigned to '{project.name}'"
        startup_message = f"""
Hi,

A security tester has been assigned to your project on FixMyBits.

Project : {project.name}
Tester  : {tester_email}

The tester will review your application and submit bug reports. You'll be notified once reports are approved.

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=startup_subject,
            message=startup_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[startup_email],
            fail_silently=False,
        )

        logger.info(
            "Project assigned emails sent to %s and %s for project %s",
            tester_email, startup_email, project_id,
        )

    except Exception as exc:
        logger.error("Failed to send project assigned email: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_application_rejected_email(self, application_id: str, tester_email: str):
    """
    Notify the tester that their application has been rejected by an admin.
    Triggered after admin rejects an application.
    """
    try:
        from apps.projects.models import Application
        application = Application.objects.select_related("project").get(id=application_id)

        subject = f"[FixMyBits] Your application for '{application.project.name}' was not accepted"
        message = f"""
Hi Tester,

Thank you for your interest in the project on FixMyBits. Unfortunately, your application
was not selected at this time.

Project : {application.project.name}

Please continue browsing other open projects and feel free to apply again in the future.

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[tester_email],
            fail_silently=False,
        )
        logger.info(
            "Application rejected email sent to %s for application %s",
            tester_email, application_id,
        )

    except Exception as exc:
        logger.error("Failed to send application rejected email: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_project_completed_email(self, project_id: str, tester_email: str):
    """
    Notify the assigned tester that the startup has marked the project as completed.
    """
    try:
        from apps.projects.models import Project
        project = Project.objects.select_related("startup").get(id=project_id)

        subject = f"[FixMyBits] Project '{project.name}' has been marked as completed"
        message = f"""
Hi Tester,

The startup has marked the following project as completed. Thank you for your excellent work!

Project : {project.name}
Startup : {project.startup.email}

Your contributions help make the internet more secure. Keep up the great work!

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[tester_email],
            fail_silently=False,
        )
        logger.info(
            "Project completed email sent to %s for project %s",
            tester_email, project_id,
        )

    except Exception as exc:
        logger.error("Failed to send project completed email: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_project_submitted_for_approval_email(self, project_id: str):
    """
    Notify admin users that a startup has submitted a project for approval.
    """
    try:
        from apps.projects.models import Project
        from django.contrib.auth import get_user_model
        User = get_user_model()

        project = Project.objects.select_related("startup").get(id=project_id)
        admin_emails = list(
            User.objects.filter(role="admin", is_active=True).values_list("email", flat=True)
        )

        if not admin_emails:
            logger.warning("No admin users found to notify for project submission %s", project_id)
            return

        subject = f"[FixMyBits] Project '{project.name}' submitted for approval"
        message = f"""
Hi Admin,

A startup has submitted a project for your review and approval.

Project  : {project.name}
Startup  : {project.startup.email}
In Scope : {project.in_scope}

Please log in to the admin panel to review and approve or reject this project.

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=False,
        )
        logger.info(
            "Project submitted for approval email sent for project %s", project_id
        )

    except Exception as exc:
        logger.error("Failed to send project submitted email: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email(self, user_email: str, reset_link: str):
    """
    Notify the user with a password reset link.
    Triggered when a user requests a password reset token.
    """
    try:
        subject = "[FixMyBits] Password Reset Request"
        message = f"""
Hi,

We received a request to reset your password on FixMyBits.

Please click the link below to set a new password:
{reset_link}

If you did not request this, please ignore this email. Your password will remain unchanged.

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
        logger.info("Password reset email sent to %s", user_email)
    except Exception as exc:
        logger.error("Failed to send password reset email: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_project_approved_email(self, project_id: str, startup_email: str):
    """
    Notify the startup that their project has been approved by an admin and is now open.
    """
    try:
        from apps.projects.models import Project
        project = Project.objects.get(id=project_id)

        subject = f"[FixMyBits] Your project '{project.name}' is now LIVE!"
        message = f"""
Hi,

Your project '{project.name}' has been reviewed and approved by our admin team. It is now open for applications from security testers.

You can view your project and track incoming applications on your dashboard.

– The FixMyBits Team
        """.strip()

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[startup_email],
            fail_silently=False,
        )
        logger.info("Project approved email sent to %s for project %s", startup_email, project_id)

    except Exception as exc:
        logger.error("Failed to send project approved email: %s", exc)
        raise self.retry(exc=exc)
