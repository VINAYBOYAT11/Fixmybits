"""
Auth views for FixMyBits.
"""
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiExample
from rest_framework import serializers

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Creates a new user + role profile. Account must be approved by admin.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: UserSerializer, 400: None},
        description="Registers a new user. The account will require admin approval.",
        tags=["auth"]
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful. Your account is pending admin approval.",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Returns JWT access and refresh tokens.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=inline_serializer(
            name="LoginRequest",
            fields={
                "email": serializers.EmailField(),
                "password": serializers.CharField(write_only=True),
            }
        ),
        responses={
            200: inline_serializer(
                name="LoginResponse",
                fields={
                    "access": serializers.CharField(),
                    "refresh": serializers.CharField(),
                    "user": UserSerializer(),
                }
            ),
            400: None, 401: None, 403: None
        },
        description="Logs in a user and returns JWT tokens.",
        tags=["auth"]
    )
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.is_banned:
            return Response(
                {"error": "Your account has been banned. Contact support."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.is_approved and user.role != "admin":
            return Response(
                {"error": "Your account is pending admin approval."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=inline_serializer(
            name="LogoutRequest",
            fields={"refresh": serializers.CharField()}
        ),
        responses={200: inline_serializer(name="LogoutResponse", fields={"message": serializers.CharField()}), 400: None},
        description="Blacklists the current refresh token.",
        tags=["auth"]
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the current authenticated user's info.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserSerializer},
        description="Returns information about the currently authenticated user.",
        tags=["auth"]
    )
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password-reset/
    Generates a password reset token and sends an email.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={200: inline_serializer("PwdResetRes", {"message": serializers.CharField()})},
        tags=["auth"]
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            try:
                user = User.objects.get(email=email)
                from django.contrib.auth.tokens import default_token_generator
                from django.utils.http import urlsafe_base64_encode
                from django.utils.encoding import force_bytes
                
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                reset_link = f"http://localhost:3000/reset-password?uid={uidb64}&token={token}"
                
                from apps.tasks.email_tasks import send_password_reset_email
                send_password_reset_email.delay(email, reset_link)
            except User.DoesNotExist:
                # Silently ignore to prevent email enumeration
                pass
            return Response({"message": "If that email is valid, a reset link has been sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset-confirm/
    Verifies token and updates the password.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={200: inline_serializer("PwdResetConfirmRes", {"message": serializers.CharField()})},
        tags=["auth"]
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uidb64 = serializer.validated_data["uidb64"]
            token = serializer.validated_data["token"]
            new_password = serializer.validated_data["new_password"]

            from django.contrib.auth.tokens import default_token_generator
            from django.utils.http import urlsafe_base64_decode

            try:
                uid = urlsafe_base64_decode(uidb64).decode()
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save(update_fields=["password"])
                return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid token or user ID."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
