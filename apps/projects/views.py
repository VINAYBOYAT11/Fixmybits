"""
Views for the projects app.
Covers startup, tester, and admin endpoints.
"""
from django.contrib.auth import get_user_model
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer

from apps.users.permissions import IsAdminRole, IsStartup, IsTester
from apps.users.serializers import UserSerializer, TesterProfileSerializer
from apps.tasks.email_tasks import send_project_assigned_email

from .models import Application, Project
from .permissions import IsAssignedTester, IsProjectOwner
from .serializers import (
    ApplicationSerializer,
    AssignTesterSerializer,
    OpenProjectSerializer,
    ProjectCreateSerializer,
    ProjectSerializer,
)
from apps.reports.models import Report
from apps.reports.serializers import ReportSerializer, ReportCreateSerializer

User = get_user_model()


# ──────────────────────────────────────────────────────────────────────────────
# STARTUP VIEWS
# ──────────────────────────────────────────────────────────────────────────────

class StartupProjectListCreateView(APIView):
    """
    GET  /api/startup/projects/  – list this startup's projects
    POST /api/startup/projects/  – create a new project
    """
    permission_classes = [IsStartup]

    @extend_schema(responses={200: ProjectSerializer(many=True)}, tags=["startup"])
    def get(self, request):
        projects = Project.objects.filter(startup=request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

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


class StartupProjectReportsView(APIView):
    """
    GET /api/startup/projects/{id}/reports/  – only approved reports
    """
    permission_classes = [IsStartup]

    @extend_schema(responses={200: ReportSerializer(many=True)}, tags=["startup"])
    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, startup=request.user)
        except Project.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        reports = Report.objects.filter(project=project, status=Report.Status.APPROVED)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)


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


class TesterOpenProjectsView(APIView):
    """
    GET /api/tester/projects/open/  – listing of all open projects
    """
    permission_classes = [IsTester]

    @extend_schema(responses={200: OpenProjectSerializer(many=True)}, tags=["tester"])
    def get(self, request):
        projects = Project.objects.filter(status=Project.Status.OPEN)
        serializer = OpenProjectSerializer(projects, many=True)
        return Response(serializer.data)


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


class TesterAssignedProjectsView(APIView):
    """
    GET /api/tester/projects/assigned/
    """
    permission_classes = [IsTester]

    @extend_schema(responses={200: OpenProjectSerializer(many=True)}, tags=["tester"])
    def get(self, request):
        projects = Project.objects.filter(assigned_tester=request.user)
        serializer = OpenProjectSerializer(projects, many=True)
        return Response(serializer.data)


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

        serializer = ReportCreateSerializer(
            data=request.data, context={"request": request, "project": project}
        )
        if serializer.is_valid():
            report = serializer.save()
            return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TesterReportsView(APIView):
    """
    GET /api/tester/reports/  – all reports submitted by this tester
    """
    permission_classes = [IsTester]

    @extend_schema(responses={200: ReportSerializer(many=True)}, tags=["tester"])
    def get(self, request):
        reports = Report.objects.filter(tester=request.user)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)


# ──────────────────────────────────────────────────────────────────────────────
# ADMIN VIEWS
# ──────────────────────────────────────────────────────────────────────────────

class AdminPendingUsersView(APIView):
    """GET /api/admin/pending-users/"""
    permission_classes = [IsAdminRole]

    @extend_schema(responses={200: UserSerializer(many=True)}, tags=["admin"])
    def get(self, request):
        users = User.objects.filter(is_approved=False, is_active=True)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminApproveUserView(APIView):
    """POST /api/admin/users/{id}/approve/"""
    permission_classes = [IsAdminRole]

    @extend_schema(request=None, responses={200: inline_serializer(name="ApproveUserResp", fields={"message": serializers.CharField(), "user": UserSerializer()})}, tags=["admin"])
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.is_approved = True
        user.save(update_fields=["is_approved"])
        return Response({"message": f"User {user.email} approved.", "user": UserSerializer(user).data})


class AdminPendingProjectsView(APIView):
    """GET /api/admin/pending-projects/"""
    permission_classes = [IsAdminRole]

    @extend_schema(responses={200: ProjectSerializer(many=True)}, tags=["admin"])
    def get(self, request):
        projects = Project.objects.filter(status=Project.Status.PENDING_APPROVAL)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)


class AdminApproveProjectView(APIView):
    """POST /api/admin/projects/{id}/approve/"""
    permission_classes = [IsAdminRole]

    @extend_schema(
        request=inline_serializer(name="ApproveProjectReq", fields={"action": serializers.ChoiceField(choices=["approve", "reject"])}),
        responses={200: ProjectSerializer},
        tags=["admin"]
    )
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, status=Project.Status.PENDING_APPROVAL)
        except Project.DoesNotExist:
            return Response({"error": "Project not found or already processed."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action", "approve")
        if action == "reject":
            project.status = Project.Status.REJECTED
        else:
            project.status = Project.Status.OPEN

        project.save(update_fields=["status"])
        return Response(ProjectSerializer(project).data)


class AdminAvailableTestersView(APIView):
    """GET /api/admin/available-testers/"""
    permission_classes = [IsAdminRole]

    @extend_schema(responses={200: UserSerializer(many=True)}, tags=["admin"])
    def get(self, request):
        testers = User.objects.filter(role="tester", is_approved=True, is_banned=False).select_related(
            "tester_profile"
        )
        serializer = UserSerializer(testers, many=True)
        return Response(serializer.data)


class AdminAssignTesterView(APIView):
    """POST /api/admin/projects/{id}/assign/"""
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
            project.assigned_tester = tester
            project.status = Project.Status.IN_PROGRESS
            project.save(update_fields=["assigned_tester", "status"])

            # Fire async email task
            send_project_assigned_email.delay(
                str(project.id),
                tester.email,
                project.startup.email,
            )

            return Response(ProjectSerializer(project).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminPendingReportsView(APIView):
    """GET /api/admin/pending-reports/"""
    permission_classes = [IsAdminRole]

    @extend_schema(responses={200: ReportSerializer(many=True)}, tags=["admin"])
    def get(self, request):
        reports = Report.objects.filter(status=Report.Status.PENDING_ADMIN_REVIEW)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)


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
