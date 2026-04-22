# App: projects

Handles projects, tester applications, and all role-specific project views.

## Models

| Model         | Description                                         |
|---------------|-----------------------------------------------------|
| `Project`     | Bug-bounty project created by a startup             |
| `Application` | A tester's application to work on a project         |

## Project Status Flow

```
draft → pending_approval → open → in_progress → completed
                        ↘ rejected
```

## Endpoints

### Startup (`/api/startup/`)

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/projects/`                      | List own projects                  |
| POST   | `/projects/`                      | Create project (saved as draft)    |
| GET    | `/projects/:id/`                  | Get project detail                 |
| POST   | `/projects/:id/submit/`           | Submit draft for admin approval    |
| POST   | `/projects/:id/complete/`         | Mark in-progress project complete  |
| GET    | `/projects/:id/reports/`          | List reports for a project         |
| GET    | `/projects/:id/applications/`     | List applications for a project    |
| GET    | `/reports/`                       | List all reports across projects   |
| PATCH  | `/reports/:id/mark_fixed/`        | Mark an approved report as fixed   |
| GET    | `/profile/`                       | Get startup profile                |
| PUT    | `/profile/`                       | Update startup profile             |

### Tester (`/api/tester/`)

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/projects/open/`                 | Browse open projects               |
| GET    | `/projects/open/:id/`             | Get open project detail            |
| GET    | `/projects/assigned/`             | List assigned projects             |
| POST   | `/projects/:id/apply/`            | Apply to a project                 |
| POST   | `/projects/:id/reports/`          | Submit a bug report                |
| GET    | `/reports/`                       | List own reports                   |
| GET    | `/reports/:id/`                   | Get report detail                  |
| PUT    | `/reports/:id/`                   | Edit pending report                |
| DELETE | `/reports/:id/`                   | Delete pending report              |
| DELETE | `/applications/:id/`              | Cancel pending application         |
| GET    | `/profile/`                       | Get tester profile                 |
| PUT    | `/profile/`                       | Update tester profile              |

### Admin (`/api/admin/`)

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/stats/`                         | Platform-wide statistics           |
| GET    | `/pending-users/`                 | List unapproved users              |
| POST   | `/users/:id/approve/`             | Approve a user                     |
| POST   | `/users/:id/ban/`                 | Ban a user                         |
| GET    | `/pending-projects/`              | List projects awaiting approval    |
| POST   | `/projects/:id/approve/`          | Approve a project (→ open)         |
| POST   | `/projects/:id/reject/`           | Reject a project with reason       |
| POST   | `/projects/:id/reopen/`           | Reopen completed/rejected project  |
| POST   | `/projects/:id/assign/`           | Assign a tester to a project       |
| GET    | `/available-testers/`             | List approved, unbanned testers    |
| GET    | `/pending-reports/`               | List reports awaiting review       |
| POST   | `/reports/:id/review/`            | Approve/spam/duplicate a report    |
| GET    | `/applications/`                  | List all applications              |
| POST   | `/applications/:id/accept/`       | Accept an application              |
| POST   | `/applications/:id/reject/`       | Reject an application              |
