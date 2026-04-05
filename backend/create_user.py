import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fixmybits.settings")
django.setup()

from apps.users.models import User
user, created = User.objects.get_or_create(email='vinayai@gmail.com')
user.is_superuser = True
user.is_staff = True
user.is_approved = True
user.role = 'admin'
user.set_password('admin123')
user.save()
print("Superuser password reset and permissions granted")
