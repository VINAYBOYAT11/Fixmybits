import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000/api"

def print_step(msg):
    print(f"\n[{'*'*20}]")
    print(f"➜ {msg}")
    print(f"[{'*'*20}]")

def login(email, password="password123"):
    res = requests.post(f"{BASE_URL}/auth/login/", json={"email": email, "password": password})
    if res.status_code != 200:
        print(f"Login failed for {email}: {res.text}")
        exit(1)
    print(f"✅ Logged in successfully as {email}")
    return res.json()["access"]

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

# 1. Login
admin_token = login("vinayai@gmail.com", "admin123")
startup_token = login("startup2@example.com")
tester_token = login("tester2@example.com")

print_step("1. Startup Creates Project")
res = requests.post(
    f"{BASE_URL}/startup/projects/",
    headers=auth_headers(startup_token),
    json={
        "name": "E2E Test Project",
        "in_scope": "*.example.com",
        "out_of_scope": "blog.example.com",
        "testing_rules": "No DDoS"
    }
)
assert res.status_code == 201, f"Failed to create project: {res.text}"
project_id = res.json()["id"]
print(f"✅ Project Created! ID: {project_id}")

print_step("2. Admin Approves Project")
res = requests.post(f"{BASE_URL}/admin/projects/{project_id}/approve/", headers=auth_headers(admin_token), json={"action": "approve"})
assert res.status_code == 200, f"Admin failed to approve project: {res.text}"
print("✅ Admin Approved Project")

print_step("3. Tester Fetches Open Projects & Applies")
res = requests.get(f"{BASE_URL}/tester/projects/open/", headers=auth_headers(tester_token))
assert res.status_code == 200
open_projects = res.json()
assert any(p["id"] == project_id for p in open_projects), "Project not found in open list"

res = requests.post(f"{BASE_URL}/tester/projects/{project_id}/apply/", headers=auth_headers(tester_token))
assert res.status_code == 201, f"Tester apply failed: {res.text}"
print("✅ Tester successfully applied")

print_step("4. Admin Assigns Tester")
# we need tester's user ID
me_res = requests.get(f"{BASE_URL}/auth/me/", headers=auth_headers(tester_token))
tester_id = me_res.json()["id"]

res = requests.post(f"{BASE_URL}/admin/projects/{project_id}/assign/", headers=auth_headers(admin_token), json={"tester_id": tester_id})
assert res.status_code == 200, f"Admin assign failed: {res.text}"
print("✅ Admin assigned tester to project")

print_step("5. Tester Submits Bug Report")
# Create a valid dummy GIF file for upload
dummy_img_path = "test_screenshot.gif"
with open(dummy_img_path, "wb") as f:
    f.write(b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;')

with open(dummy_img_path, "rb") as img:
    # Use data instead of json for multipart/form-data
    res = requests.post(
        f"{BASE_URL}/tester/projects/{project_id}/reports/",
        headers=auth_headers(tester_token),
        data={
            "title": "SQL Injection found",
            "description": "Found a SQLi in the login form.",
            "severity": "High",
            "vulnerability_type": "Injection",
            "steps_to_reproduce": "1. go to login 2. put ' OR 1=1--"
        },
        files={"screenshot": img}
    )
import re
if res.status_code == 500:
    m = re.search(r'<title>(.*?)</title>', res.text, re.IGNORECASE)
    print(f"500 ERROR: {m.group(1) if m else 'No title'}")
assert res.status_code == 201, f"Report creation failed: {res.status_code}"
report_id = res.json()["id"]
print(f"✅ Tester submitted bug report! ID: {report_id}")
os.remove(dummy_img_path)

print_step("6. Admin Approves Bug Report")
res = requests.post(f"{BASE_URL}/admin/reports/{report_id}/review/", headers=auth_headers(admin_token), json={"action": "approve"})
assert res.status_code == 200, f"Admin report review failed: {res.text}"
print("✅ Admin approved the bug report")

print_step("7. Startup Marks Report as Fixed")
res = requests.patch(f"{BASE_URL}/startup/reports/{report_id}/mark_fixed/", headers=auth_headers(startup_token))
assert res.status_code == 200, f"Startup failed to mark as fixed: {res.text}"
print("✅ Startup marked report as FIXED")

print_step("🎉 All Endpoints Validated! The workflow is 100% operational.")
