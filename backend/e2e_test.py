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

print_step("1.5. Startup Submits Project")
res = requests.post(f"{BASE_URL}/startup/projects/{project_id}/submit/", headers=auth_headers(startup_token))
assert res.status_code == 200, f"Startup failed to submit project: {res.text}"
print("✅ Startup submitted project for approval")

print_step("2. Admin Approves Project")
res = requests.post(f"{BASE_URL}/admin/projects/{project_id}/approve/", headers=auth_headers(admin_token), json={"action": "approve"})
assert res.status_code == 200, f"Admin failed to approve project: {res.text}"
print("✅ Admin Approved Project")

print_step("3.5. Tester Cancels an Application")
# Let's create a dummy project just to test cancellation
res_dummy = requests.post(
    f"{BASE_URL}/startup/projects/",
    headers=auth_headers(startup_token),
    json={"name": "Dummy App Cancel", "in_scope": "x", "testing_rules": "y"}
)
dummy_id = res_dummy.json()["id"]
requests.post(f"{BASE_URL}/startup/projects/{dummy_id}/submit/", headers=auth_headers(startup_token))
requests.post(f"{BASE_URL}/admin/projects/{dummy_id}/approve/", headers=auth_headers(admin_token), json={"action": "approve"})

# Apply to dummy and cancel
res_apply_dummy = requests.post(f"{BASE_URL}/tester/projects/{dummy_id}/apply/", headers=auth_headers(tester_token))
app_cancel_id = res_apply_dummy.json()["id"]

res_cancel = requests.delete(f"{BASE_URL}/tester/applications/{app_cancel_id}/", headers=auth_headers(tester_token))
assert res_cancel.status_code == 204, f"Tester cancel failed: {res_cancel.text}"
print("✅ Tester successfully cancelled application")

print_step("3. Tester Fetches Open Projects & Applies (Primary)")
res_open = requests.get(f"{BASE_URL}/tester/projects/open/", headers=auth_headers(tester_token))
assert res_open.status_code == 200
res_apply = requests.post(f"{BASE_URL}/tester/projects/{project_id}/apply/", headers=auth_headers(tester_token))
assert res_apply.status_code == 201, f"Tester apply failed: {res_apply.text}"
print("✅ Tester successfully applied")

print_step("4. Admin Assigns Tester via Application Accept")
# we need tester's user ID
me_res = requests.get(f"{BASE_URL}/auth/me/", headers=auth_headers(tester_token))
tester_id = me_res.json()["id"]

# Actually let's test the new application accept flow!
# First get the application id
res = requests.get(f"{BASE_URL}/admin/applications/?project_id={project_id}", headers=auth_headers(admin_token))
assert res.status_code == 200
apps = res.json()["results"]
assert len(apps) > 0, "No applications found"
application_id = apps[0]["id"]

res = requests.post(f"{BASE_URL}/admin/applications/{application_id}/accept/", headers=auth_headers(admin_token))
assert res.status_code == 200, f"Admin application accept failed: {res.text}"
print("✅ Admin assigned tester to project by accepting application")

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
print(f"✅ Tester submitted bug report with Screenshot! ID: {report_id}")
os.remove(dummy_img_path)

print_step("5.5 Tester Submits Report with Google Drive Link")
res = requests.post(
    f"{BASE_URL}/tester/projects/{project_id}/reports/",
    headers=auth_headers(tester_token),
    json={
        "title": "XSS Vulnerability found",
        "description": "Reflected XSS on search page.",
        "severity": "Medium",
        "steps_to_reproduce": "1. Search for <script>alert(1)</script>",
        "drive_link": "https://drive.google.com/file/d/test1234/view"
    }
)
assert res.status_code == 201, f"Report with drive link creation failed: {res.text}"
drive_report_id = res.json()["id"]
print(f"✅ Tester submitted bug report with Google Drive link! ID: {drive_report_id}")

print_step("6. Admin Approves Bug Report")
res = requests.post(f"{BASE_URL}/admin/reports/{report_id}/review/", headers=auth_headers(admin_token), json={"action": "approve"})
assert res.status_code == 200, f"Admin report review failed: {res.text}"
print("✅ Admin approved the bug report")

print_step("7. Startup Marks Report as Fixed")
res = requests.patch(f"{BASE_URL}/startup/reports/{report_id}/mark_fixed/", headers=auth_headers(startup_token))
assert res.status_code == 200, f"Startup failed to mark as fixed: {res.text}"
print("✅ Startup marked report as FIXED")

print_step("8. Testing Generics List View Search")
res = requests.get(f"{BASE_URL}/admin/available-testers/?search=tester2", headers=auth_headers(admin_token))
assert res.status_code == 200
assert res.json()["count"] >= 1
print("✅ Admin Generics Search works correctly")

print_step("9. Testing Password Reset Workflow")
res = requests.post(f"{BASE_URL}/auth/password-reset/", json={"email": "startup2@example.com"})
assert res.status_code == 200, f"Password reset request failed: {res.text}"
print("✅ Password reset token successfully requested")

print_step("🎉 All Endpoints Validated! The workflow is 100% operational.")
