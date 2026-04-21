# FixMyBits Backend - AI Frontend Development Guide

This document is specifically tailored for AI agents and frontend developers to understand the structure, architecture, and API patterns of the **FixMyBits** backend. The goal is to provide enough semantic context so that you can construct the React frontend interfaces, manage states, and integrate with the APIs correctly.

## 🏗️ Architecture Overview
- **Framework**: Django 4.2+ & Django REST Framework (DRF).
- **Authentication**: JWT via `djangorestframework-simplejwt`.
- **Database**: PostgreSQL (Production) / SQLite3 (Local dev).
- **Media Storage**: Cloudinary (for profile logos & bug report screenshots).
- **API Documentation**: Available natively at `/api/docs/` (Swagger UI via drf-spectacular). Use this to dynamically understand payload shapes and query parameters.

---

## 🔐 Authentication & Roles
The system relies heavily on **Role-Based Access Control (RBAC)**.
There are three primary user roles: **Startup**, **Tester**, and **Admin**. 
User authentication uses an email as the primary identifier instead of a standard username.

### Auth Flow
1. **Login**: `POST /api/auth/token/` with `{ "email": "...", "password": "..." }`. Returns `reset` and `access` tokens.
2. **Authorization Header**: Store the `access` token (e.g., in localStorage or cookies) and send it with subsequent requests:
   `Authorization: Bearer <your_access_token>`
3. **Refresh**: `POST /api/auth/token/refresh/`

### User Profiles
Depending on their role, users have an attached profile.
- **TesterProfile**: Contains `skills` (JSON array), `tools` (JSON array), `experience_level` (beginner, intermediate, advanced), `bio`, and `reputation_score`.
- **StartupProfile**: Contains `company_name`, `website`, and `logo`.

**Frontend Hint**: When designing the React frontend, persist the user's `role` in global state (Zustand, Redux, or Context). You will need `ProtectedRoute` wrappers that restrict rendering based on whether a user `is_startup`, `is_tester`, or `is_admin_role`.

---

## 🗄️ Core Domains (Data Models)

### 1. Projects
Startups create *Projects* (Bug Bounty programs).
- **Fields**: `name`, `in_scope`, `out_of_scope`, `testing_rules`, `status`.
- **Statuses**: `draft`, `pending_approval` (waiting on admin), `open` (visible to testers), `in_progress` (a tester is assigned), `completed`, `rejected`.
- **Flow**: An Admin must approve a project before testers can apply. Once a tester is assigned, it moves to `in_progress`.

### 2. Applications
Testers apply to *Projects* that are `open`.
- **Fields**: `project` (FK), `tester` (FK), `status`.
- **Statuses**: `pending`, `accepted`, `rejected`, `cancelled`.
- **Flow**: A startup reviews applications and accepts **one** tester. Accepting an application automatically moves the associated Project to `in_progress`.

### 3. Reports (Bug Reports)
Once a tester is assigned, they find and submit vulnerabilities for the project.
- **Fields**: `title`, `description`, `steps_to_reproduce`, `severity` (Low, Medium, High, Critical), `screenshot`, `drive_link`, `status`, `admin_feedback`.
- **Statuses**: `pending_admin_review`, `approved`, `spam`, `duplicate`, `fixed`.
- **Flow**: Testers submit > Admin reviews > Startup reviews & fixes.

### 4. Report Messages (Chat)
Communication between the tester, startup, and admin regarding a specific report.
- **Fields**: `report` (FK), `sender` (FK), `content`, `created_at`.

---

## 🌐 API Endpoint Namespaces

The URL router is namespaced by role to easily partition views:

### System & Docs
- `GET /healthz/`: Liveness probe.
- `GET /api/docs/`: **Swagger UI for everything**.

### `api/auth/`
Handles token generation, password resets, registration (for specific roles), and user profile fetching/updating.
*Expected endpoints:* `/api/auth/register/`, `/api/auth/me/`, `/api/auth/profile/`.

### `api/startup/`
Endpoints specifically for startups.
*Common actions:* 
- Create/update a project.
- List applications for their project.
- Accept an application.
- View reports submitted against their project.

### `api/tester/`
Endpoints specifically for testers.
*Common actions:*
- List open projects to browse.
- Apply to a project.
- List projects they are assigned to.
- Submit a bug report.

### `api/admin/`
Platform administrator endpoints.
*Common actions:*
- Review unapproved projects.
- Moderate users.
- Review submitted reports.

### `api/reports/`
General endpoints for bug reports (e.g. Chat functionality).
*Common actions:*
- Add a comment to a report.
- Fetch messages for a report.

---

## 💻 Guidelines for the AI Frontend Developer

When building the React components based on this backend:

1. **Error Handling**: DRF returns structural validation errors on `400 Bad Request`.
   - Payload shape: `{"field_name": ["Error detail 1", "Error detail 2"]}` or `{"detail": "Non-field error."}`
   - *Design the frontend forms to automatically map these keys to the respective input fields.*
2. **File Uploads**: When submitting `logo` or `screenshot`, you must use `multipart/form-data` instead of `application/json`.
3. **Data Fetching**: Use a robust data fetching library like `React Query` or `RTK Query` due to the multi-status nature of Projects, Applications, and Reports. Caching and invalidation sequences will be heavily utilized when an Application is "accepted" (which updates the Project status).
4. **CORS**: Ensure your frontend runs on a port permitted by `CORS_ALLOWED_ORIGINS` in the backend settings (usually `http://localhost:5173` for Vite).
5. **Theme & Looks**: The frontend architecture relies on a premium dark mode UI (as requested by the project constraints). Build the components using standard modern React patterns while abstracting styles so they are easily updatable.

Have fun hacking, AI! Use `/api/docs/` locally as your exact Swagger API truth for payload signatures.
