"""
Views for the reports app — Chat (ReportMessage) endpoints.
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Report, ReportMessage
from .serializers import ReportMessageSerializer


class ReportMessageListCreateView(APIView):
    """
    GET  /api/reports/{report_id}/messages/  – list all messages for a report
    POST /api/reports/{report_id}/messages/  – send a message

    Accessible by:
      - The tester who submitted the report
      - The startup that owns the project
      - Any admin
    """
    permission_classes = [IsAuthenticated]

    def _get_report_or_403(self, request, report_id):
        """Return the report if the user has access, else None."""
        try:
            report = Report.objects.select_related(
                "tester", "project", "project__startup"
            ).get(pk=report_id)
        except Report.DoesNotExist:
            return None, Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if (
            user.role == "admin"
            or report.tester == user
            or report.project.startup == user
        ):
            return report, None

        return None, Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    def get(self, request, report_id):
        report, err = self._get_report_or_403(request, report_id)
        if err:
            return err
        messages = report.messages.select_related("sender").all()
        serializer = ReportMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, report_id):
        report, err = self._get_report_or_403(request, report_id)
        if err:
            return err
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"error": "Message content cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        message = ReportMessage.objects.create(
            report=report,
            sender=request.user,
            content=content,
        )
        return Response(ReportMessageSerializer(message).data, status=status.HTTP_201_CREATED)
