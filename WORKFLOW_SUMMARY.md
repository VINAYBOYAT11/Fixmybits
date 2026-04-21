# FixMyBits - Logic Flow Summary

## User Registration & Onboarding Flow

```
1. User registers via /api/auth/register/
   - Chooses role: 'startup', 'tester', or 'admin'
   - Admin accounts auto-approved, others pending approval

2. Admin receives notification (in admin panel)
   - Admin can approve/reject from /api/admin/pending-users/

3. Once approved:
   - User can log in and access role-specific dashboard
   - Profile creation (TesterProfile/StartupProfile) on first login
```

## Project Creation & Management Flow

### Startup Perspective:
```
1. Create project (draft)
   - POST /api/startup/projects/

2. Submit for admin approval
   - POST /api/startup/projects/{id}/submit/
   - Status changes: draft → pending_approval

3. Admin reviews project
   - Admin can approve (→ open) or reject (→ rejected)

4. Once approved (open):
   - Testers can apply via /api/tester/projects/{id}/apply/

5. Admin assigns tester
   - Manually via /api/admin/projects/{id}/assign/
   - Or by accepting an application via /api/admin/applications/{id}/accept/
   - Status changes: open → in_progress

6. Tester works & submits reports
   - POST /api/tester/projects/{id}/reports/

7. Admin reviews reports
   - Can mark as approved, spam, or duplicate

8. Startup marks reports as fixed
   - PATCH /api/startup/reports/{id}/mark_fixed/

9. Startup marks project completed
   - POST /api/startup/projects/{id}/complete/
   - Status: in_progress → completed
```

### Tester Perspective:
```
1. Browse open projects
   - GET /api/tester/projects/open/

2. Apply to project
   - POST /api/tester/projects/{id}/apply/

3. Wait for admin assignment
   - Can cancel pending applications via /api/tester/applications/{id}/

4. Once assigned:
   - Project appears in /api/tester/projects/assigned/
   - Can submit reports via /api/tester/projects/{id}/reports/

5. Track reputation:
   - +10 reputation points per approved report
   - Reputation displayed in profile
```

## Admin Dashboard Flow

### Admin Capabilities:
```
1. User Management:
   - View pending users: GET /api/admin/pending-users/
   - Approve/reject users: POST /api/admin/users/{id}/approve/

2. Project Management:
   - View pending projects: GET /api/admin/pending-projects/
   - Approve/reject projects: POST /api/admin/projects/{id}/approve/
   - Reopen completed/rejected projects: POST /api/admin/projects/{id}/reopen/

3. Tester Assignment:
   - View available testers: GET /api/admin/available-testers/
   - Assign tester directly: POST /api/admin/projects/{id}/assign/

4. Application Management:
   - View all applications: GET /api/admin/applications/
   - Accept/reject applications: POST /api/admin/applications/{id}/accept/

5. Report Moderation:
   - View pending reports: GET /api/admin/pending-reports/
   - Review reports: POST /api/admin/reports/{id}/review/
   - Actions: approve, spam, duplicate

6. Platform Statistics:
   - GET /api/admin/stats/
   - Includes users, projects, reports, applications counts
```

## Password Reset Flow

```
1. User requests reset
   - POST /api/auth/password-reset/
   - Receives email with reset link (uidb64 + token)

2. Frontend receives token via URL
   - /reset-password?uid={uidb64}&token={token}
   - Sends to backend for validation

3. User submits new password
   - POST /api/auth/password-reset-confirm/
   - Validates token and updates password

4. User can log in with new password
```

## Email Notifications (Async via Celery)

| Event | Recipient | Task |
|-------|-----------|------|
| Project assigned | Tester & Startup | send_project_assigned_email |
| Application rejected | Tester | send_application_rejected_email |
| Project completed | Tester | send_project_completed_email |
| Project submitted for approval | Admin | send_project_submitted_for_approval_email |
| Project approved | Startup | send_project_approved_email |
| Report approved | Tester | send_report_approved_email |
| Password reset requested | User | send_password_reset_email |

## Status Enums Reference

### Project Status:
- `draft` → `pending_approval` → `open` → `in_progress` → `completed`
- Rejection path: `pending_approval` → `rejected`

### Report Status:
- `pending_admin_review` → `approved` → `fixed`
- Alternative paths: `pending_admin_review` → `spam` or `duplicate`

### Application Status:
- `pending` → `accepted` or `rejected` or `cancelled`

## Frontend Routing

### Auth Routes:
- `/` → Login
- `/register` → Registration
- `/reset-password` → Password reset

### Dashboard Routes (role-based):
- `/dashboard` → Role-specific overview
- `/profile` → User profile
- `/projects` → Project listings
- `/reports` → Report management
- `/applications` → Application tracking

### Admin Routes:
- `/admin/users` → User management
- `/admin/projects` → Project moderation
- `/admin/reports` → Report review
- `/admin/applications` → Application management

## API Authentication

- JWT tokens required for all endpoints except:
  - `/api/auth/login/`
  - `/api/auth/register/`
  - `/api/auth/password-reset/`
  - `/api/auth/password-reset-confirm/`
- Token format: `Authorization: Bearer <access_token>`
- Refresh tokens: `/api/auth/login/` returns both `access` and `refresh`
- Token blacklisting: `/api/auth/logout/` blacklists refresh token

## Error Handling

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created (e.g., new project)
- `400` - Bad request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Server error

### Error Response Format:
```json
{
  "error": "Human-readable error message",
  "details": { /* Optional field-specific errors */ }
}