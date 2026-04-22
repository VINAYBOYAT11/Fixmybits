# App: reports

Handles bug report chat messages between testers, startups, and admins.

## Models

| Model           | Description                                          |
|-----------------|------------------------------------------------------|
| `Report`        | Bug report (defined in `apps.projects` via FK)       |
| `ReportMessage` | A chat message on a report thread                    |

> Note: The `Report` model lives in `apps.projects.models` but is referenced here via foreign key.

## Report Status Flow

```
pending_admin_review → approved → fixed
                    ↘ spam
                    ↘ duplicate
```

## Severity Levels

`Low` → `Medium` → `High` → `Critical`

## Endpoints (`/api/reports/`)

| Method | Path                          | Auth     | Description                          |
|--------|-------------------------------|----------|--------------------------------------|
| GET    | `/:report_id/messages/`       | Yes      | List all messages for a report       |
| POST   | `/:report_id/messages/`       | Yes      | Send a message on a report           |

### Access Control

Messages are accessible to:
- The tester who submitted the report
- The startup that owns the project
- Any admin user
