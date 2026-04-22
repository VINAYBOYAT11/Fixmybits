# Jules Bug Detection Mission: FixMyBits

## Objective
Perform a comprehensive bug detection and security audit of the FixMyBits project. Identify security vulnerabilities, logic errors, and integration mismatches between the React frontend and Django backend.

## Scope

### 1. Security Audit
- **Authentication**: Analyze `localStorage` usage for JWT tokens. Assess the risk of token theft via XSS.
- **CSRF & CORS**: Verify that CSRF protection is correctly implemented for state-changing requests and that CORS policy is sufficiently restrictive.
- **Common Vulnerabilities**: Scan for potential XSS, SQL Injection (in custom queries/filters), and Insecure Direct Object References (IDOR).
- **Environment**: Check for any exposed secrets in `.env.example` or hardcoded in the source code.

### 2. Integration Audit
- **API Discrepancies**: Compare `frontend_react2/src/services/api.js` and `Landing page design/` API calls against the Django URL patterns in `backend/`.
- **Data Validation**: Ensure frontend forms and backend serializers have consistent validation rules (e.g., character limits, required fields).

### 3. Logic & Permissions Audit
- **Role-Based Access Control (RBAC)**: Verify that users with the `tester` role cannot access `startup` endpoints and vice versa.
- **Admin Overrides**: Ensure Admin actions (approve/reject/ban) are bulletproof and cannot be bypassed by regular users.
- **Workflow Integrity**: Confirm the Project and Report status transitions (e.g., `draft` -> `open`) are logical and strictly enforced.

### 4. Infrastructure & Data
- **Seeding Consistency**: Audit `seed_data.py` to ensure the generated data follows the latest model constraints.
- **Migrations**: Check for any pending or inconsistent database migrations.

## Deliverables
- A detailed Markdown report (`BUGS_REPORT.md`) summarizing all findings.
- Categorize findings by severity: `Critical`, `High`, `Medium`, `Low`, and `Inconsistency`.
- (Optional) Provide suggested fixes for the identified issues.

## Technical Context
- **Backend**: Django REST Framework, SimpleJWT, SQLite (dev), PostgreSQL (prod).
- **Frontend**: React (Vite), Axios.
- **Entry Points**:
  - Backend: `backend/fixmybits/settings.py`, `backend/apps/`
  - Frontend: `frontend_react2/src/services/api.js`, `Landing page design/src/`
