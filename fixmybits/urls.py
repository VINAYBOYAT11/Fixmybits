"""
URL configuration for fixmybits project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.db import connection
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def api_root(request):
    return JsonResponse({
        "message": "Welcome to the FixMyBits API. Please visit /api/docs/ to interactively browse and test all available endpoints."
    })


def healthz(request):
    """Liveness + readiness probe used by load-balancers and docker-compose."""
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False
    status = 200 if db_ok else 503
    return JsonResponse({"status": "ok" if db_ok else "error", "db": db_ok}, status=status)


urlpatterns = [
    path("healthz/", healthz, name="healthz"),
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api-root"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/auth/", include("apps.users.urls")),
    path("api/startup/", include("apps.projects.urls.startup")),
    path("api/tester/", include("apps.projects.urls.tester")),
    path("api/admin/", include("apps.projects.urls.admin_urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=getattr(settings, "MEDIA_ROOT", ""))
