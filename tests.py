"""
Automated test suite for FixMyBits.
Covers: auth, permission boundaries, and report submission flows.
Run: pytest -v
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS / FIXTURES
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    return APIClient()


def make_user(email, password="password123", role="tester", is_approved=True, **kwargs):
    user = User.objects.create_user(email=email, password=password, role=role, **kwargs)
    user.is_approved = is_approved
    user.save()
    return user


def jwt_token(user):
    return str(RefreshToken.for_user(user).access_token)


def auth_client(user):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt_token(user)}")
    return client


# ─────────────────────────────────────────────────────────────────────────────
# AUTH TESTS
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestRegistration:
    def test_register_tester_success(self, api_client):
        res = api_client.post("/api/auth/register/", {
            "email": "newtester@test.com",
            "password": "strongpass1",
            "confirm_password": "strongpass1",
            "role": "tester",
        }, format="json")
        assert res.status_code == 201
        assert "user" in res.data

    def test_register_startup_requires_company_name(self, api_client):
        res = api_client.post("/api/auth/register/", {
            "email": "startup@test.com",
            "password": "strongpass1",
            "confirm_password": "strongpass1",
            "role": "startup",
        }, format="json")
        assert res.status_code == 400
        assert "company_name" in str(res.data)

    def test_register_admin_is_blocked(self, api_client):
        """Public registration must reject role=admin."""
        res = api_client.post("/api/auth/register/", {
            "email": "admin@test.com",
            "password": "strongpass1",
            "confirm_password": "strongpass1",
            "role": "admin",
        }, format="json")
        assert res.status_code == 400
        assert "Admin accounts cannot be created" in str(res.data)

    def test_register_mismatched_passwords(self, api_client):
        res = api_client.post("/api/auth/register/", {
            "email": "mismatch@test.com",
            "password": "pass1234",
            "confirm_password": "different",
            "role": "tester",
        }, format="json")
        assert res.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client):
        make_user("logintest@test.com", password="pass1234")
        res = api_client.post("/api/auth/login/", {
            "email": "logintest@test.com",
            "password": "pass1234",
        }, format="json")
        assert res.status_code == 200
        assert "access" in res.data
        assert "refresh" in res.data

    def test_login_wrong_password(self, api_client):
        make_user("wrongpass@test.com", password="correct1")
        res = api_client.post("/api/auth/login/", {
            "email": "wrongpass@test.com",
            "password": "wrong",
        }, format="json")
        assert res.status_code == 401

    def test_unapproved_user_cannot_login(self, api_client):
        make_user("pending@test.com", password="pass1234", is_approved=False)
        res = api_client.post("/api/auth/login/", {
            "email": "pending@test.com",
            "password": "pass1234",
        }, format="json")
        assert res.status_code in (401, 403)


@pytest.mark.django_db
class TestPasswordReset:
    def test_password_reset_request_valid_email(self, api_client):
        make_user("resetme@test.com")
        res = api_client.post("/api/auth/password-reset/", {"email": "resetme@test.com"}, format="json")
        # Always returns 200 (anti-enum)
        assert res.status_code == 200

    def test_password_reset_unknown_email_returns_200(self, api_client):
        """Must return 200 even for unknown email to prevent enumeration."""
        res = api_client.post("/api/auth/password-reset/", {"email": "nobody@test.com"}, format="json")
        assert res.status_code == 200


# ─────────────────────────────────────────────────────────────────────────────
# PERMISSION BOUNDARY TESTS
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestPermissionBoundaries:
    def test_unauthenticated_cannot_access_tester_projects(self, api_client):
        res = api_client.get("/api/tester/projects/open/")
        assert res.status_code == 401

    def test_startup_cannot_access_tester_projects(self):
        startup = make_user("startup@perms.com", role="startup")
        # Create startup profile manually
        from apps.users.models import StartupProfile
        StartupProfile.objects.create(user=startup, company_name="TestCo")
        client = auth_client(startup)
        res = client.get("/api/tester/projects/open/")
        assert res.status_code == 403

    def test_tester_cannot_access_startup_endpoints(self):
        tester = make_user("tester@perms.com", role="tester")
        from apps.users.models import TesterProfile
        TesterProfile.objects.create(user=tester)
        client = auth_client(tester)
        res = client.get("/api/startup/projects/")
        assert res.status_code == 403

    def test_tester_cannot_access_admin_endpoints(self):
        tester = make_user("tester@admin.com", role="tester")
        from apps.users.models import TesterProfile
        TesterProfile.objects.create(user=tester)
        client = auth_client(tester)
        res = client.get("/api/admin/pending-users/")
        assert res.status_code == 403


# ─────────────────────────────────────────────────────────────────────────────
# REPORT SERIALIZER VALIDATION TESTS
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestReportValidation:
    def test_invalid_drive_link_domain_rejected(self):
        from apps.reports.serializers import ReportCreateSerializer
        s = ReportCreateSerializer(data={
            "title": "Bug",
            "description": "desc",
            "steps_to_reproduce": "steps",
            "severity": "Low",
            "drive_link": "https://dropbox.com/s/somefile",
        })
        assert not s.is_valid()
        assert "drive_link" in s.errors

    def test_valid_google_drive_link_accepted(self):
        from apps.reports.serializers import ReportCreateSerializer
        s = ReportCreateSerializer(data={
            "title": "Bug",
            "description": "desc",
            "steps_to_reproduce": "steps",
            "severity": "Low",
            "drive_link": "https://drive.google.com/file/d/abc123/view",
        })
        assert s.is_valid(), s.errors

    def test_no_screenshot_or_drive_link_rejected(self):
        from apps.reports.serializers import ReportCreateSerializer
        s = ReportCreateSerializer(data={
            "title": "Bug",
            "description": "desc",
            "steps_to_reproduce": "steps",
            "severity": "Low",
        })
        assert not s.is_valid()
        assert "non_field_errors" in s.errors or any("screenshot" in str(v) or "drive" in str(v) for v in s.errors.values())
