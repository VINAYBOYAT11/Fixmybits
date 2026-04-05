import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fixmybits.settings")
django.setup()

from apps.users.models import User, StartupProfile, TesterProfile

print("Seeding Startups...")
for i in range(1, 4):
    email = f"startup{i}@example.com"
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(email=email, password="password123", role=User.Role.STARTUP, is_approved=True)
        StartupProfile.objects.create(user=user, company_name=f"Startup Corp {i}", website=f"https://startup{i}.example.com")
        print(f"Created: {email}")
    else:
        print(f"Already exists: {email}")

print("\nSeeding Testers...")
for i in range(1, 11):
    email = f"tester{i}@example.com"
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(email=email, password="password123", role=User.Role.TESTER, is_approved=True)
        TesterProfile.objects.create(
            user=user,
            skills=["Web Security", "Network Security"] if i % 2 == 0 else ["Mobile Security", "Cryptography"],
            tools=["Burp Suite", "Nmap"] if i % 2 == 0 else ["Metasploit", "Wireshark"],
            experience_level=TesterProfile.ExperienceLevel.INTERMEDIATE,
            bio=f"I am tester {i}, ready to hunt bugs!",
            reputation_score=10 * i,
        )
        print(f"Created: {email}")
    else:
        print(f"Already exists: {email}")

print("\nSeeding Complete! All passwords are set to: password123")
