"""
WSGI config for fixmybits project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fixmybits.settings")
application = get_wsgi_application()
