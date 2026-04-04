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
    Triggered after admin uses the assign endpoint.
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
