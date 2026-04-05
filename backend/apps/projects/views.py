"""
Views for the projects app.
Covers startup, tester, and admin endpoints.
"""
import os
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Exists, OuterRef
from rest_framework import status, serializers, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from apps.users.permissions import IsAdminRole, IsStartup, IsTester
from apps.users.serializers import UserSerializer, TesterProfileSerializer, StartupProfileSerializer
from apps.tasks.email_tasks import (
    send_project_assigned_email,
    send_application_rejected_email,
    send_project_completed_email,
    send_project_submitted_for_approval_email,
)

from .models import Application, Project
from .permissions import IsAssignedTester, IsProjectOwner, IsReportOwner
from .serializers import (
    ApplicationListSerializer,
    ApplicationSerializer,
    AssignTesterSerializer,
    OpenProjectSerializer,
    ProjectCreateSerializer,
    ProjectRejectSerializer,
    ProjectSerializer,
)
from apps.reports.models import Report
from apps.reports.serializers import ReportSerializer, ReportCreateSerializer, ReportUpdateSerializer

User = get_user_model()


# ──────────────────────────────────────────────────────────────────────────────
# SHARED PAGINATION
# ──────────────────────────────────────────────────────────────────────────────

class StandardPagination(PageNumberPagination):
    """20 items per page; clients can override with ?page_size=N (max 100)."""
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# ──────────────────────────────────────────────────────────────────────────────
# STARTUP VIEWS
# ──────────────────────────────────────────────────────────────────────────────

class StartupProjectListCreateView(generics.ListAPIView):
    """
    GET  /api/startup/projects/  – list this startup's projects (paginated)
    POST /api/startup/projects/  – create a new project (saved as draft)
    """
    permission_classes = [IsStartup]
    serializer_class = ProjectSerializer
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "name"]
    search_fields = ["name", "in_scope"]

    def get_queryset(self):
        return Project.objects.filter(startup=self.request.user)

    @extend_schema(request=ProjectCreateSerializer, responses={201: ProjectSerializer}, tags=["startup"])
    def post(self, request):
        serializer = ProjectCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            project = serializer.save()
            return Response(ProjectSerializer(project).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StartupProjectDetailView(APIView):
    """
    GET /api/startup/projects/{id}/  – retrieve a specific project
    """
    permission_classes = [IsStartup]

    def get_object(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None
        return project

    @extend_schema(responses={200: ProjectSerializer}, tags=["startup"])
    def get(self, request, pk):
        project = self.get_object(request, pk)
        if not project:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        if project.startup != request.user:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        return Response(ProjectSerializer(project).data)


class StartupProjectSubmitView(APIView):
    """
    POST /api/startup/projects/{id}/submit/
    Move a draft project to pending_approval for admin review.
    """
    permission_classes = [IsStartup]

    @extend_schema(request=None, responses={200: ProjectSerializer}, tags=["startup"])
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, startup=request.user)
        except Project.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        if project.status != Project.Status.DRAFT:
            return Response(
                {"error": f"Only draft projects can be submitted. Current status: {project.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project.status = Project.Status.PENDING_APPROVAL
        project.save(update_fields=["status"])

        # Notify admins asynchronously
        send_project_submitted_for_approval_email.delay(str(project.id))

        return Response(ProjectSerializer(project).data)


class StartupProjectCompleteView(APIView):
    """
    POST /api/startup/projects/{id}/complete/
    Startup marks an in-progress project as completed.
    """
    permission_classes = [IsStartup]

    @extend_schema(request=None, responses={200: ProjectSerializer}, tags=["startup"])
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, startup=request.user)
        except Project.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        if project.status != Project.Status.IN_PROGRESS:
            return Response(
                {"error": f"Only in-progress projects can be completed. Current status: {project.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project.status = Project.Status.COMPLETED
        project.save(update_fields=["status"])

        # Notify assigned tester
        if project.assigned_tester:
            send_project_completed_email.delay(str(project.id), project.assigned_tester.email)

        return Response(ProjectSerializer(project).data)


class StartupProjectReportsView(generics.ListAPIView):
    """
    GET /api/startup/projects/{id}/reports/  – only approved reports (paginated)
    """
    permission_classes = [IsStartup]
    serializer_class = ReportSerializer
    ordering_fields = ["submitted_at", "severity"]
    search_fields = ["title", "tester__email"]

    def get_queryset(self):
        return Report.objects.filter(project_id=self.kwargs.get("pk"), status=Report.Status.APPROVED)

    @extend_schema(responses={200: ReportSerializer(many=True)}, tags=["startup"])
    def get(self, request, *args, **kwargs):
        if not Project.objects.filter(pk=kwargs.get("pk"), startup=request.user).exists():
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        return super().get(request, *args, **kwargs)


class StartupMarkReportFixedView(APIView):
    """
    PATCH /api/startup/reports/{id}/mark_fixed/
    """
    permission_classes = [IsStartup]

    @extend_schema(
        request=None,
        responses={200: ReportSerializer},
        tags=["startup"]
    )
    def patch(self, request, pk):
        try:
            report = Report.objects.get(pk=pk, project__startup=request.user, status=Report.Status.APPROVED)
        except Report.DoesNotExist:
            return Response({"error": "Report not found or not accessible."}, status=status.HTTP_404_NOT_FOUND)

        report.status = Report.Status.FIXED
        report.save(update_fields=["status"])
        return Response(ReportSerializer(report).data)


class StartupProjectApplicationsView(generics.ListAPIView):
    """
    GET /api/startup/projects/{id}/applications/
    List all applications for the startup's project, with optional ?status= filter.
    Paginated: 20 per page.
    """
    permission_classes = [IsStartup]
    serializer_class = ApplicationListSerializer
    filterset_fields = ["status"]
    ordering_fields = ["applied_at"]
    search_fields = ["tester__email", "tester__tester_profile__skills"]

    def get_queryset(self):
        return Application.objects.filter(project_id=self.kwargs.get("pk")).select_related("tester", "tester__tester_profile")

    @extend_schema(responses={200: ApplicationListSerializer(many=True)}, tags=["startup"])
    def get(self, request, *args, **kwargs):
        if not Project.objects.filter(pk=kwargs.get("pk"), startup=request.user).exists():
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        return super().get(request, *args, **kwargs)


class StartupProfileView(APIView):
    """
    GET /api/startup/profile/  – retrieve startup profile
    PUT /api/startup/profile/  – update startup profile (company_name, website, logo)
    """
    permission_classes = [IsStartup]

    @extend_schema(responses={200: StartupProfileSerializer}, tags=["startup"])
    def get(self, request):
        try:
            profile = request.user.startup_profile
        except Exception:
            return Response({"error": "Startup profile not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StartupProfileSerializer(profile).data)

    @extend_schema(request=StartupProfileSerializer, responses={200: StartupProfileSerializer}, tags=["startup"])
    def put(self, request):
        try:
            profile = request.user.startup_profile
        except Exception:
            return Response({"error": "Startup profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StartupProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────────────────────────────────────
# TESTER VIEWS
# ──────────────────────────────────────────────────────────────────────────────

class TesterProfileView(APIView):
    """
    GET /api/tester/profile/
    PUT /api/tester/profile/
    """
    permission_classes = [IsTester]

    @extend_schema(responses={200: TesterProfileSerializer}, tags=["tester"])
    def get(self, request):
        profile = request.user.tester_profile
        serializer = TesterProfileSerializer(profile)
        return Response(serializer.data)

    @extend_schema(request=TesterProfileSerializer, responses={200: TesterProfileSerializer}, tags=["tester"])
    def put(self, request):
        from apps.users.serializers import TesterProfileUpdateSerializer
        profile = request.user.tester_profile
        serializer = TesterProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TesterOpenProjectsView(generics.ListAPIView):
    """
    GET /api/tester/projects/open/  – listing of all open projects (paginated)
    """
    permission_classes = [IsTester]
    serializer_class = OpenProjectSerializer
    search_fields = ["name", "startup__startup_profile__company_name", "in_scope"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return Project.objects.filter(status=Project.Status.OPEN).annotate(
            has_applied=Exists(Application.objects.filter(project=OuterRef('pk'), tester=self.request.user))
        )


class TesterApplyView(APIView):
    """
    POST /api/tester/projects/{id}/apply/
    """
    permission_classes = [IsTester]

    @extend_schema(request=None, responses={201: ApplicationSerializer}, tags=["tester"])
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, status=Project.Status.OPEN)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found or is not accepting applications."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if Application.objects.filter(project=project, tester=request.user).exists():
            return Response(
                {"error": "You have already applied to this project."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application = Application.objects.create(project=project, tester=request.user)
        return Response(ApplicationSerializer(application).data, status=status.HTTP_201_CREATED)


class TesterAssignedProjectsView(generics.ListAPIView):
    """
    GET /api/tester/projects/assigned/ (paginated)
    """
    permission_classes = [IsTester]
    serializer_class = OpenProjectSerializer
    search_fields = ["name", "startup__startup_profile__company_name"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return Project.objects.filter(assigned_tester=self.request.user)


class TesterSubmitReportView(APIView):
    """
    POST /api/tester/projects/{id}/reports/  – multipart for screenshot
    """
    permission_classes = [IsTester]

    @extend_schema(request=ReportCreateSerializer, responses={201: ReportSerializer}, tags=["tester"])
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, assigned_tester=request.user)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found or you are not the assigned tester."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if project.status != Project.Status.IN_PROGRESS:
            return Response(
                {"error": f"You can only submit reports for in-progress projects. This project is {project.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReportCreateSerializer(
            data=request.data, context={"request": request, "project": project}
        )
        if serializer.is_valid():
            report = serializer.save()
            return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TesterReportsView(generics.ListAPIView):
    """
    GET /api/tester/reports/  – all reports submitted by this tester (paginated)
    """
    permission_classes = [IsTester]
    serializer_class = ReportSerializer
    filterset_fields = ["status", "severity", "project"]
    search_fields = ["title", "project__name"]
    ordering_fields = ["submitted_at"]

    def get_queryset(self):
        return Report.objects.filter(tester=self.request.user)


class TesterReportDetailView(APIView):
    """
    GET    /api/tester/reports/{id}/   – retrieve a single report
    PUT    /api/tester/reports/{id}/   – update a pending report
    DELETE /api/tester/reports/{id}/   – delete a pending report (also removes file)
    """
    permission_classes = [IsTester]

    def get_object(self, request, pk):
        try:
            return Report.objects.get(pk=pk, tester=request.user)
        except Report.DoesNotExist:
            return None

    @extend_schema(responses={200: ReportSerializer}, tags=["tester"])
    def get(self, request, pk):
        report = self.get_object(request, pk)
        if not report:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ReportSerializer(report).data)

    @extend_schema(request=ReportUpdateSerializer, responses={200: ReportSerializer}, tags=["tester"])
    def put(self, request, pk):
        report = self.get_object(request, pk)
        if not report:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        if report.status != Report.Status.PENDING_ADMIN_REVIEW:
            return Response(
                {"error": "Only reports with status 'pending_admin_review' can be edited."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReportUpdateSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ReportSerializer(report).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(responses={204: None}, tags=["tester"])
    def delete(self, request, pk):
        report = self.get_object(request, pk)
        if not report:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        if report.status != Report.Status.PENDING_ADMIN_REVIEW:
            return Response(
                {"error": "Only reports with status 'pending_admin_review' can be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Remove screenshot file from storage if it exists
        if report.screenshot:
            try:
                screenshot_path = report.screenshot.path
                if os.path.isfile(screenshot_path):
                    os.remove(screenshot_path)
            except (ValueError, NotImplementedError):
                # Remote storage (e.g. Cloudinary) — just let the field deletion handle it
                pass

        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TesterCancelApplicationView(APIView):
    """
    DELETE /api/tester/applications/{id}/
    Cancel a pending application (tester only, while status is pending).
    """
    permission_classes = [IsTester]

    @extend_schema(responses={204: None}, tags=["tester"])
    def delete(self, request, pk):
        try:
            application = Application.objects.get(pk=pk, tester=request.user)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        if application.status != Application.Status.PENDING:
            return Response(
                {"error": "Only pending applications can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = Application.Status.CANCELLED
        application.save(update_fields=["status"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────────────────────────────────────
# ADMIN VIEWS
# ──────────────────────────────────────────────────────────────────────────────

class AdminPendingUsersView(generics.ListAPIView):
    """GET /api/admin/pending-users/ (paginated)"""
    permission_classes = [IsAdminRole]
    serializer_class = UserSerializer
    search_fields = ["email"]
    ordering_fields = ["date_joined"]

    def get_queryset(self):
        return User.objects.filter(is_approved=False, is_active=True)


class AdminApproveUserView(APIView):
    """POST /api/admin/users/{id}/approve/"""
    permission_classes = [IsAdminRole]

    @extend_schema(
        request=None,
        responses={200: inline_serializer(name="ApproveUserResp", fields={"message": serializers.CharField(), "user": UserSerializer()})},
        tags=["admin"]
    )
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.is_approved = True
        user.save(update_fields=["is_approved"])
        return Response({"message": f"User {user.email} approved.", "user": UserSerializer(user).data})


class AdminPendingProjectsView(generics.ListAPIView):
    """GET /api/admin/pending-projects/ (paginated)"""
    permission_classes = [IsAdminRole]
    serializer_class = ProjectSerializer
    search_fields = ["name", "startup__email", "startup__startup_profile__company_name"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return Project.objects.filter(status=Project.Status.PENDING_APPROVAL)


class AdminApproveProjectView(APIView):
    """POST /api/admin/projects/{id}/approve/ — approves a pending project."""
    permission_classes = [IsAdminRole]

    @extend_schema(
        request=None,
        responses={200: ProjectSerializer},
        tags=["admin"]
    )
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, status=Project.Status.PENDING_APPROVAL)
        except Project.DoesNotExist:
            return Response({"error": "Project not found or already processed."}, status=status.HTTP_404_NOT_FOUND)

        project.status = Project.Status.OPEN
        project.save(update_fields=["status"])
        return Response(ProjectSerializer(project).data)


class AdminProjectRejectView(APIView):
    """POST /api/admin/projects/{id}/reject/ — reject a pending project with optional reason."""
    permission_classes = [IsAdminRole]

    @extend_schema(request=ProjectRejectSerializer, responses={200: ProjectSerializer}, tags=["admin"])
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, status=Project.Status.PENDING_APPROVAL)
        except Project.DoesNotExist:
            return Response({"error": "Project not found or not pending approval."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProjectRejectSerializer(data=request.data)
        if serializer.is_valid():
            project.status = Project.Status.REJECTED
            project.rejection_reason = serializer.validated_data.get("reason", "")
            project.save(update_fields=["status", "rejection_reason"])
            return Response(ProjectSerializer(project).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProjectReopenView(APIView):
    """
    POST /api/admin/projects/{id}/reopen/
    Reopen a completed or rejected project. Clears assigned_tester.
    """
    permission_classes = [IsAdminRole]

    @extend_schema(request=None, responses={200: ProjectSerializer}, tags=["admin"])
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        if project.status not in (Project.Status.COMPLETED, Project.Status.REJECTED):
            return Response(
                {"error": f"Only completed or rejected projects can be reopened. Current status: {project.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Rejected → pending_approval; completed → open
        if project.status == Project.Status.REJECTED:
            new_status = Project.Status.PENDING_APPROVAL
        else:
            new_status = Project.Status.OPEN

        project.status = new_status
        project.assigned_tester = None
        project.rejection_reason = None
        project.save(update_fields=["status", "assigned_tester", "rejection_reason"])
        return Response(ProjectSerializer(project).data)


class AdminAvailableTestersView(generics.ListAPIView):
    """GET /api/admin/available-testers/ (paginated)"""
    permission_classes = [IsAdminRole]
    serializer_class = UserSerializer
    search_fields = ["email", "tester_profile__skills"]
    ordering_fields = ["date_joined", "tester_profile__reputation_score"]

    def get_queryset(self):
        return User.objects.filter(role="tester", is_approved=True, is_banned=False).select_related(
            "tester_profile"
        )


class AdminAssignTesterView(APIView):
    """
    POST /api/admin/projects/{id}/assign/
    Assign a tester directly by tester_id.
    Optionally accepts application_id to also accept the related application.
    """
    permission_classes = [IsAdminRole]

    @extend_schema(request=AssignTesterSerializer, responses={200: ProjectSerializer}, tags=["admin"])
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, status=Project.Status.OPEN)
        except Project.DoesNotExist:
            return Response({"error": "Project not found or not open."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssignTesterSerializer(data=request.data)
        if serializer.is_valid():
            tester = serializer.validated_data["tester_id"]
            application = serializer.validated_data.get("application_id")

            project.assigned_tester = tester
            project.status = Project.Status.IN_PROGRESS
            project.save(update_fields=["assigned_tester", "status"])

            # If an application was provided, accept it
            if application:
                try:
                    application.status = Application.Status.ACCEPTED
                    application.save(update_fields=["status"])
                except DjangoValidationError as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            # Fire async email task
            send_project_assigned_email.delay(
                str(project.id),
                tester.email,
                project.startup.email,
            )

            # Auto-reject remaining pending applications
            pending_apps = Application.objects.filter(project=project, status=Application.Status.PENDING)
            for app in pending_apps:
                app.status = Application.Status.REJECTED
                app.save(update_fields=["status"])
                send_application_rejected_email.delay(str(app.id), app.tester.email)

            return Response(ProjectSerializer(project).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminPendingReportsView(generics.ListAPIView):
    """GET /api/admin/pending-reports/ (paginated)"""
    permission_classes = [IsAdminRole]
    serializer_class = ReportSerializer
    search_fields = ["title", "project__name", "tester__email"]
    ordering_fields = ["submitted_at", "severity"]

    def get_queryset(self):
        return Report.objects.filter(status=Report.Status.PENDING_ADMIN_REVIEW)


class AdminReviewReportView(APIView):
    """POST /api/admin/reports/{id}/review/"""
    permission_classes = [IsAdminRole]

    @extend_schema(
        request=inline_serializer(name="ReviewReportReq", fields={
            "action": serializers.ChoiceField(choices=["approve", "spam", "duplicate"]),
            "feedback": serializers.CharField(required=False, allow_blank=True)
        }),
        responses={200: ReportSerializer},
        tags=["admin"]
    )
    def post(self, request, pk):
        try:
            report = Report.objects.get(pk=pk, status=Report.Status.PENDING_ADMIN_REVIEW)
        except Report.DoesNotExist:
            return Response({"error": "Report not found or already reviewed."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")
        feedback = request.data.get("feedback", "")

        valid_actions = {
            "approve": Report.Status.APPROVED,
            "spam": Report.Status.SPAM,
            "duplicate": Report.Status.DUPLICATE,
        }
        if action not in valid_actions:
            return Response(
                {"error": f"Invalid action. Choose from: {list(valid_actions.keys())}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.status = valid_actions[action]
        report.admin_feedback = feedback
        report.save(update_fields=["status", "admin_feedback"])

        if action == "approve":
            from apps.tasks.email_tasks import send_report_approved_email
            send_report_approved_email.delay(str(report.id), report.tester.email)

            # Increment tester reputation
            profile = report.tester.tester_profile
            profile.reputation_score += 10
            profile.save(update_fields=["reputation_score"])

        return Response(ReportSerializer(report).data)


class AdminApplicationListView(generics.ListAPIView):
    """
    GET /api/admin/applications/
    List all applications with optional filters:
      ?status=pending|accepted|rejected|cancelled
      ?project_id=<uuid>
    Paginated: 20 per page.
    """
    permission_classes = [IsAdminRole]
    serializer_class = ApplicationListSerializer
    filterset_fields = ["status", "project"]
    search_fields = ["tester__email", "project__name"]
    ordering_fields = ["applied_at"]

    def get_queryset(self):
        return Application.objects.select_related("project", "tester", "tester__tester_profile")


class AdminApplicationAcceptView(APIView):
    """
    POST /api/admin/applications/{id}/accept/
    Accept an application:
      - Sets application.status = 'accepted'
      - Sets project.assigned_tester = application.tester
      - Sets project.status = 'in_progress'
      - Sends email notification to tester & startup
    """
    permission_classes = [IsAdminRole]

    @extend_schema(
        request=None,
        responses={200: ApplicationListSerializer},
        tags=["admin"],
    )
    def post(self, request, pk):
        try:
            application = Application.objects.select_related(
                "project", "tester", "project__startup"
            ).get(pk=pk)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        if application.status != Application.Status.PENDING:
            return Response(
                {"error": f"Only pending applications can be accepted. Current status: {application.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project = application.project
        if project.status != Project.Status.OPEN:
            return Response(
                {"error": f"Project must be 'open' to accept an application. Current status: {project.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Guard: no duplicate accepted application (enforced in model.save() too)
        try:
            application.status = Application.Status.ACCEPTED
            application.save(update_fields=["status"])
        except DjangoValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Update project
        project.assigned_tester = application.tester
        project.status = Project.Status.IN_PROGRESS
        project.save(update_fields=["assigned_tester", "status"])

        # Fire async email
        send_project_assigned_email.delay(
            str(project.id),
            application.tester.email,
            project.startup.email,
        )

        # Auto-reject remaining pending applications
        pending_apps = Application.objects.filter(project=project, status=Application.Status.PENDING)
        for app in pending_apps:
            app.status = Application.Status.REJECTED
            app.save(update_fields=["status"])
            send_application_rejected_email.delay(str(app.id), app.tester.email)

        return Response(ApplicationListSerializer(application).data)


class AdminApplicationRejectView(APIView):
    """
    POST /api/admin/applications/{id}/reject/
    Reject an application and send rejection email.
    """
    permission_classes = [IsAdminRole]

    @extend_schema(request=None, responses={200: ApplicationListSerializer}, tags=["admin"])
    def post(self, request, pk):
        try:
            application = Application.objects.select_related("project", "tester").get(pk=pk)
        except Application.DoesNotExist:
            return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        if application.status != Application.Status.PENDING:
            return Response(
                {"error": f"Only pending applications can be rejected. Current status: {application.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = Application.Status.REJECTED
        application.save(update_fields=["status"])

        # Fire rejection email async
        send_application_rejected_email.delay(str(application.id), application.tester.email)

        return Response(ApplicationListSerializer(application).data)
