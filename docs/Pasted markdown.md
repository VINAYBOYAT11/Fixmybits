# FixMyBits — Complete Frontend Specification

> **Status**: Ready for approval. Confirm before code generation begins.
> **Project**: FixMyBits — Non-Profit Cybersecurity Bug-Bounty Marketplace
> **Backend**: Django 4.2 + DRF + JWT, running at `http://127.0.0.1:8000`
> **Base URL for API**: `http://127.0.0.1:8000`

---

## 1 · Product Goal & Business Objective

FixMyBits is a **non-profit, role-based cybersecurity marketplace** that connects:
- **Startups** (who need their products security-tested) with
- **Testers** (skilled security researchers who find and report bugs)

...moderated by trusted **Admins** who approve projects, assign testers, and review bug reports.

**Business objective**: Democratize access to professional security testing for early-stage startups by creating a trusted, friction-free marketplace with zero monetary transactions. The platform's value is community-driven reputation and knowledge exchange.

---

## 2 · Target Users & Personas

| Persona | Role | Goals | Pain Points |
|---|---|---|---|
| **StartupFounder** (Startup) | Submits testing projects, reviews reports | Get their product security-tested quickly; easily understand vulnerability reports | Complex forms, unclear status flows |
| **SecurityResearcher** (Tester) | Browses projects, applies, submits bug reports | Find meaningful work; build reputation; clear project scopes | Ambiguous project scopes, opaque application statuses |
| **PlatformAdmin** (Admin) | Approves users/projects, assigns testers, moderates reports | Full oversight; quick action queues; platform health at a glance | Scattered data, no clear queues |

---

## 3 · Core User Journeys

### Journey 1 — Startup Lifecycle
```
Register (startup role) → Login → Create Project (draft) → Submit for Approval
→ Admin approves → Project goes OPEN → Testers apply
→ Startup reviews applicants → Admin assigns tester
→ Project moves IN_PROGRESS → Tester submits reports
→ Startup reviews approved reports → Marks bugs FIXED → Marks project COMPLETED
```

### Journey 2 — Tester Lifecycle
```
Register (tester role) → Login → Browse Open Projects → Apply to Project
→ Wait for assignment → (If assigned) Project moves IN_PROGRESS
→ Submit bug reports (with screenshot/drive link) → Wait for admin review
→ Approved → reputation_score +10
```

### Journey 3 — Admin Lifecycle
```
Login → Dashboard: see pending queues
→ Review pending projects → Approve/Reject with reason
→ Review pending reports → Approve/Mark Spam/Duplicate
→ Assign testers to open projects
→ Monitor platform stats
```

---

## 4 · Sitemap & Navigation Flow

```
PUBLIC (unauthenticated)
├── /                        ← Landing page (marketing)
├── /login                   ← Login form
├── /register                ← Register form (role-selector: Startup | Tester)
└── /reset-password          ← Password reset confirm (receives ?uid=&token=)

AUTHENTICATED — Startup (/startup/*)
├── /startup/dashboard       ← Overview: project count, report summary
├── /startup/projects        ← List all my projects (filterable by status)
├── /startup/projects/new    ← Create new project form
├── /startup/projects/:id    ← Project detail: info + applications list + reports list
├── /startup/reports         ← All reports across my projects (filterable)
└── /startup/profile         ← Edit company_name, website, logo

AUTHENTICATED — Tester (/tester/*)
├── /tester/dashboard        ← Overview: reputation score, active projects, open report count  
├── /tester/projects/open    ← Browse open projects + search
├── /tester/projects/mine    ← My assigned projects
├── /tester/projects/:id     ← Project detail: submit report form + my reports
├── /tester/reports          ← All my submitted reports
└── /tester/profile          ← Edit skills, tools, experience level, bio

AUTHENTICATED — Admin (/admin/*)
├── /admin/dashboard         ← Platform stats overview (users, projects, reports by status)
├── /admin/projects/pending  ← Queue: pending approval projects → Approve/Reject
├── /admin/projects/open     ← Open projects: assign a tester
├── /admin/reports/pending   ← Queue: pending reports → Approve/Spam/Duplicate
├── /admin/users/pending     ← Pending user approvals
└── /admin/users             ← All testers list (for assignment context)

SHARED
└── /reports/:id/chat        ← Report chat thread (accessible by tester + startup + admin)
```

**Navigation pattern**: Role-aware persistent **sidebar** (collapsed on mobile), **topbar** with user avatar/role badge + logout.

---

## 5 · Page-by-Page Breakdown

### 5.1 Landing Page (`/`)
**Purpose**: Marketing entry point. Convert visitors to sign up.

**Content**:
- Hero: headline, sub-headline, two CTAs (Login / Register)
- "How it works" section: 3-column cards (For Startups / For Testers / Trusted by Admins)
- Benefits section
- Footer: copyright, GitHub link

**States**: Static. No auth needed.

---

### 5.2 Login Page (`/login`)
**Form fields**: `email` (required), `password` (required)
**Actions**: POST `/api/auth/login/`
**On success**: Store `access`, `refresh`, `user` in store → redirect based on `user.role`
**On error**: Show field-level or banner error (`Invalid credentials`, `Account banned`)
**Link**: "Forgot password?" → triggers forgot-password modal or `/forgot-password` page
**Link**: "Don't have an account? Register"

---

### 5.3 Register Page (`/register`)
**Step 1** — Role selector: large clickable cards ("I'm a Startup" / "I'm a Security Tester")
**Step 2A** — Startup fields: `email`, `password`, `confirm_password`, `company_name`, `website (optional)`
**Step 2B** — Tester fields: `email`, `password`, `confirm_password`, `bio (optional)`, `experience_level (select)`, `skills (tag input)`, `tools (tag input)`

**Validation**: client-side + map DRF `400` errors to field labels
**Success**: redirect to login with success toast

---

### 5.4 Password Reset (`/reset-password?uid=&token=`)
**Fields**: `new_password`, `confirm_password`
**Action**: POST `/api/auth/password-reset-confirm/` with `{uidb64, token, new_password, confirm_password}`

---

### 5.5 Startup Dashboard (`/startup/dashboard`)
**Widgets** (data from project list + reports list):
- Total projects
- Projects by status (pie/donut or badge counts)
- Unread/open reports awaiting fix
- Quick links: "Create Project", "View Reports"

---

### 5.6 Startup Projects List (`/startup/projects`)
**Data**: GET `/api/startup/projects/`
**Features**: Filter by status chip row, search bar (name), pagination
**Card per project**: name, status badge (color-coded), created date, CTA "View"
**FAB**: "+ New Project"

**Project Status Colors**:
| Status | Color |
|---|---|
| draft | Muted grey |
| pending_approval | Amber |
| open | Cyan |
| in_progress | Blue |
| completed | Green |
| rejected | Red |

---

### 5.7 Create Project (`/startup/projects/new`)
**Form fields**:
- `name` (text, required)
- `in_scope` (textarea, required) — markdown supported hint
- `out_of_scope` (textarea, optional)
- `testing_rules` (JSON or structured key-value adder, optional)

**Action**: POST `/api/startup/projects/` → creates as `draft`
**After create**: Redirect to `/startup/projects/:id` with option to "Submit for Approval"

---

### 5.8 Project Detail — Startup (`/startup/projects/:id`)
**Sections** (tabs or accordion):
1. **Overview**: name, scope, rules, status, created date, rejection_reason (if rejected)
2. **Applications**: list of applicants (tester email, skills, experience, applied_at, status badge). Startup cannot directly accept — that's Admin's action. Show read-only.
3. **Reports**: list of approved/fixed reports (title, severity badge, status, submitted_at). Link to chat per report.
4. **Actions**:
   - If `draft`: "Submit for Approval" button → POST `/api/startup/projects/:id/submit/`
   - If `in_progress`: "Mark as Completed" → POST `/api/startup/projects/:id/complete/`
   - Per approved report: "Mark Fixed" → PATCH `/api/startup/reports/:id/mark_fixed/`

---

### 5.9 Startup Reports (`/startup/reports`)
**Data**: GET `/api/startup/reports/`
**Features**: Filter by `status`, `severity`; search by title/tester
**Table or card list**: title, project name, severity badge, status badge, tester email, submitted date, chat link

---

### 5.10 Startup Profile (`/startup/profile`)
**Data**: GET `/api/startup/profile/`
**Editable fields**: `company_name`, `website`, logo upload (`multipart/form-data`)
**Alert**: remind user `logo` upload uses multipart, not JSON

---

### 5.11 Tester Dashboard (`/tester/dashboard`)
**Widgets**:
- Reputation score (animated number)
- Reports submitted / approved / pending
- Assigned projects count
- Quick links: "Browse Open Projects", "My Reports"

---

### 5.12 Browse Open Projects (`/tester/projects/open`)
**Data**: GET `/api/tester/projects/open/?search=`
**Card per project**: company name (from startup_profile), project name, in_scope snippet, created date
**Has_applied badge**: "Applied" chip if `has_applied=true` (annotated by backend)
**CTA**: "Apply" button → POST `/api/tester/projects/:id/apply/` → error if already applied
**Search**: live search via `?search=`

---

### 5.13 My Assigned Projects (`/tester/projects/mine`)
**Data**: GET `/api/tester/projects/assigned/`
**Card**: project name, startup company_name, status badge, "View & Submit Report" CTA

---

### 5.14 Project Detail — Tester (`/tester/projects/:id`)
**Sections**:
1. **Project Info**: name, scope, out_of_scope, testing_rules, status
2. **Submit Bug Report** (only if project status === `in_progress`):
   - `title` (required)
   - `description` (textarea, required)
   - `steps_to_reproduce` (textarea, required)
   - `severity` (select: Low/Medium/High/Critical)
   - `screenshot` (file input, image only)
   - `drive_link` (URL, optional)
   - Submit → POST `/api/tester/projects/:id/reports/` (multipart)
3. **My Reports on this project**: list with edit/delete (only `pending_admin_review`)

---

### 5.15 My Reports (`/tester/reports`)
**Data**: GET `/api/tester/reports/`
**Filter**: status, severity, project
**Table/card**: title, project name, severity badge, status badge, submitted date
**Actions**: Edit (if `pending_admin_review`) | Delete (if `pending_admin_review`) | Chat link

---

### 5.16 Tester Profile (`/tester/profile`)
**Data**: GET `/api/tester/profile/`
**Editable**: `skills` (tag input), `tools` (tag input), `experience_level` (select), `bio` (textarea)
**Read-only**: `reputation_score` (shown prominently as a badge/stat)

---

### 5.17 Admin Dashboard (`/admin/dashboard`)
**Data**: GET `/api/admin/stats/`
**Widgets**:
- Total Users: testers / startups / admins / banned
- Projects: by status (donut chart)
- Reports: by status + by severity (two mini charts)
- Applications: total / pending / accepted
- Action Queue: "X pending projects", "Y pending reports", "Z pending users"

---

### 5.18 Admin Pending Projects (`/admin/projects/pending`)
**Data**: GET `/api/admin/pending-projects/`
**Card per project**: name, startup email, company_name, in_scope, created date
**Actions**:
- "Approve" → POST `/api/admin/projects/:id/approve/`
- "Reject" → opens modal: reason text → POST `/api/admin/projects/:id/reject/`

---

### 5.19 Admin Open Projects — Assign Tester (`/admin/projects/open`)
**Data**: GET all projects with `status=open` (use `/api/admin/pending-projects/`-equivalent or stats)
**Per project**: show applications → button "Assign" → opens tester picker modal
**Tester picker modal**: GET `/api/admin/available-testers/` → list testers with skills, reputation
**Assign** → POST `/api/admin/projects/:id/assign/` with `{tester_id, application_id?}`

---

### 5.20 Admin Pending Reports (`/admin/reports/pending`)
**Data**: GET `/api/admin/pending-reports/`
**Card per report**: title, severity, project name, tester email, description excerpt, screenshot preview
**Actions**:
- "Approve" → `{action: "approve", feedback: ""}` → POST `/api/admin/reports/:id/review/`
- "Spam" → modal with optional feedback
- "Duplicate" → modal with optional feedback

---

### 5.21 Admin Pending Users (`/admin/users/pending`)
**Data**: GET `/api/admin/pending-users/`
**Card**: email, role, date_joined
**Action**: "Approve" → POST `/api/admin/users/:id/approve/`

---

### 5.22 Report Chat (`/reports/:id/chat`)
**Data**: GET `/api/reports/:id/messages/` → list of messages
**Render**: chat bubble UI — right-aligned (own messages), left-aligned (others)
**Send**: POST `/api/reports/:id/messages/` `{content}`
**Real-time**: Poll every 5s (no WebSocket in backend). Or manual "Refresh" button.
**Access**: tester of the report + startup that owns the project + any admin

---

## 6 · Component Architecture

### 6.1 Layout Components
```
<RootLayout>
  <Sidebar role={role} />          ← Role-aware nav links
  <Topbar user={user} />           ← Avatar, role badge, logout
  <MainContent>
    <Outlet />                     ← React Router outlet
  </MainContent>
</RootLayout>

<AuthLayout>                       ← For login/register/reset pages
  <Outlet />
</AuthLayout>
```

### 6.2 Shared UI Components

| Component | Props | Behavior |
|---|---|---|
| `<Button>` | variant(primary/secondary/danger/ghost), size, loading, disabled, onClick | Spinner on loading |
| `<Badge>` | status or severity string | Color-mapped from status constants |
| `<Toast>` | message, type(success/error/info/warning) | Auto-dismiss 4s, portal-rendered |
| `<Modal>` | isOpen, onClose, title, children, footer | Trap focus, ESC closes, backdrop blur |
| `<Card>` | children, className | Glass-morphism surface |
| `<Input>` | label, error, ...htmlInputProps | Highlights on error |
| `<Textarea>` | label, error, rows | Same as Input |
| `<Select>` | label, options, error, value, onChange | Custom styled |
| `<TagInput>` | value, onChange, placeholder | Chip-based for skills/tools |
| `<FileUpload>` | accept, onChange, preview | Shows image preview on select |
| `<Spinner>` | size | Full-page or inline |
| `<EmptyState>` | icon, title, message, action? | No-data placeholder |
| `<ErrorState>` | message, onRetry? | Fetch error fallback |
| `<Pagination>` | page, total, pageSize, onChange | Standard paginator |
| `<SeverityBadge>` | severity | Red/Orange/Yellow/Green |
| `<StatusBadge>` | status, domain(project/report/application) | Color-coded per domain |
| `<ConfirmModal>` | title, message, onConfirm, dangerous? | Destructive action guard |
| `<SearchInput>` | value, onChange, placeholder | Debounced 300ms |
| `<StatCard>` | label, value, icon, trend? | Admin dashboard stat widget |

### 6.3 Feature Components

**Auth**
- `<LoginForm />`
- `<RegisterForm />` — multi-step with role selector
- `<PasswordResetForm />`

**Projects**
- `<ProjectCard />` — used in lists
- `<ProjectStatusFlow />` — visual status stepper
- `<ProjectForm />` — create/edit project
- `<TestingRulesEditor />` — key-value pair input for `testing_rules` JSON
- `<ApplicationCard />` — per applicant in startup project detail
- `<TesterPickerModal />` — admin tester assignment

**Reports**
- `<ReportCard />` — used in lists
- `<ReportForm />` — bug report submission (multipart)
- `<ReportDetailPanel />` — full report view with screenshot
- `<AdminReportReviewModal />` — approve/spam/duplicate + feedback
- `<ChatThread />` — messages list
- `<ChatInput />` — message composer

**Admin**
- `<StatsGrid />` — platform overview widgets
- `<AdminProjectQueue />` — pending project action list
- `<AdminReportQueue />` — pending report action list

---

## 7 · State Management Approach

**Tool**: React Context + `useReducer` for global auth state. **No Redux** (overkill for this scope).

### Auth Context (`AuthContext`)
```js
{
  user: { id, email, role, is_approved, is_banned, startup_profile, tester_profile },
  accessToken: string,
  refreshToken: string,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Actions**: `LOGIN`, `LOGOUT`, `UPDATE_USER`

**Persistence**: `localStorage` for `accessToken` + `refreshToken`. Restore on app mount via `GET /api/auth/me/`.

### Server State
**Tool**: **TanStack Query (React Query v5)** — for all API data fetching, caching, and invalidation.

```
- useProjects()           → projects list
- useProject(id)          → single project
- useReports()            → reports list
- useReport(id)           → single report
- useApplications(pid)    → applications for a project
- useAdminStats()         → admin dashboard stats
- useTesterProfile()
- useStartupProfile()
- useMessages(reportId)   → poll every 5s with refetchInterval
```

**Invalidation strategy**:
- On "Submit for Approval" → invalidate `projects`
- On "Apply" → invalidate `openProjects`
- On "Mark Fixed" / "Mark Completed" → invalidate `projects` + `reports`
- On Admin "Approve Project" → invalidate `pendingProjects`
- On Admin "Review Report" → invalidate `pendingReports`

---

## 8 · API Interaction Plan

### 8.1 HTTP Client: Axios Instance

```js
// src/services/api.js
const api = axios.create({ baseURL: 'http://127.0.0.1:8000' });

// Request interceptor: inject JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(null, async error => {
  if (error.response?.status === 401) {
    // attempt refresh → retry → else logout
  }
  return Promise.reject(error);
});
```

### 8.2 Error Handling Convention
DRF returns two shapes:
- Field errors: `{"field_name": ["message"]}` → map to form fields
- Non-field: `{"detail": "message"}` or `{"error": "message"}` → toast banner

All mutation hooks surface errors via `onError` → `toast.error(...)`.

### 8.3 File Uploads
Use `FormData` for: logo upload (`PUT /api/startup/profile/`), report screenshot (`POST /api/tester/projects/:id/reports/`).
```js
const formData = new FormData();
// append fields + file
api.put('/api/startup/profile/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### 8.4 Pagination
Backend uses `?page=N&page_size=N`. All list queries include page params. `Pagination` component triggers refetch with new page.

### 8.5 Token Refresh Flow
```
401 received
  → try POST /api/auth/token/refresh/ with refreshToken
    → success: update accessToken in store + localStorage, retry original request
    → failure: dispatch LOGOUT → redirect /login
```

---

## 9 · Design System

### 9.1 Color Palette — Dark Mode First
```css
:root {
  --bg-base:        #0c0e1a;   /* Near-black with blue tinge */
  --bg-surface:     #13162a;   /* Cards, modals */
  --bg-elevated:    #1a1f38;   /* Input backgrounds, hover states */
  --border:         #252b4a;   /* Subtle borders */

  --primary:        #6c63ff;   /* Electric violet — CTA buttons */
  --primary-hover:  #5a52e8;
  --primary-glow:   rgba(108, 99, 255, 0.25);

  --accent:         #00d9c4;   /* Cyan-teal — active states, links */
  --accent-glow:    rgba(0, 217, 196, 0.2);

  --text-primary:   #e8ecf7;
  --text-secondary: #8892b0;
  --text-muted:     #4a5568;

  /* Semantic */
  --success:  #22c55e;
  --warning:  #f59e0b;
  --danger:   #ef4444;
  --info:     #3b82f6;

  /* Status — Projects */
  --status-draft:           #6b7280;
  --status-pending:         #f59e0b;
  --status-open:            #00d9c4;
  --status-in_progress:     #3b82f6;
  --status-completed:       #22c55e;
  --status-rejected:        #ef4444;

  /* Severity */
  --sev-low:      #22c55e;
  --sev-medium:   #f59e0b;
  --sev-high:     #f97316;
  --sev-critical: #ef4444;
}
```

### 9.2 Typography
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace; /* Code blocks in reports */

/* Scale */
--text-xs:   0.75rem;    /* 12px */
--text-sm:   0.875rem;   /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg:   1.125rem;   /* 18px */
--text-xl:   1.25rem;    /* 20px */
--text-2xl:  1.5rem;     /* 24px */
--text-3xl:  1.875rem;   /* 30px */
--text-4xl:  2.25rem;    /* 36px */
```

### 9.3 Spacing
`4px` base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.

### 9.4 Border Radius
```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### 9.5 Shadows / Glow
```css
--shadow-sm:    0 1px 3px rgba(0,0,0,0.4);
--shadow-md:    0 4px 16px rgba(0,0,0,0.5);
--shadow-glow:  0 0 20px var(--primary-glow);
--glass:        backdrop-filter: blur(12px); background: rgba(19,22,42,0.8);
```

### 9.6 UI Rules
- **Glass morphism** on cards: `background: rgba(19,22,42,0.85); backdrop-filter: blur(12px); border: 1px solid var(--border)`
- **Hover lift**: `transform: translateY(-2px); box-shadow: var(--shadow-glow)` on interactive cards
- **Focus rings**: `outline: 2px solid var(--primary); outline-offset: 2px`
- Minimum tap target: 44×44px
- Line height for body: `1.6`
- All interactive elements have `cursor: pointer` and a hover state

---

## 10 · UX Behavior

### 10.1 Loading States
- **Page-level**: Skeleton screens (not spinner) for list pages
- **Button**: Inline spinner replaces label while mutation is pending; button disabled
- **Data refetch**: Stale data shown while revalidating (React Query stale-while-revalidate)

### 10.2 Hover & Micro-interactions
- All buttons: subtle `transform: scale(1.02)` on hover (150ms ease)
- Cards: `translateY(-2px)` lift + glow shadow on hover
- Badge chips: no hover effect (decorative only)
- Sidebar links: left border highlight slide-in animation on active
- Toast enter: slide in from bottom-right, exit: fade out

### 10.3 Transitions
- Page transitions: `framer-motion` `AnimatePresence` — subtle fade+slide (200ms)
- Modal open: scale from 0.95 + fade (200ms)
- Status badge changes: cross-fade

### 10.4 Feedback
- All mutations: optimistic UI not required; show loading → success toast → data refetch
- Form validation: real-time on blur, full sweep on submit attempt
- Success toasts: green, auto-dismiss 4s
- Error toasts: red, persist until dismissed (X button)

---

## 11 · All UI States

For every data-dependent component, handle:

| State | Implementation |
|---|---|
| **Loading** | `<Spinner />` or Skeleton |
| **Empty** | `<EmptyState icon title message action? />` |
| **Error** | `<ErrorState message onRetry />` |
| **Success** | Normal render + toast |
| **Forbidden** | Redirect or "Access Denied" inline message |
| **No internet** | Axios network error → banner |

**Per-page examples**:
- Open Projects (tester): empty = "No projects available right now. Check back later!"
- Pending Reports (admin): empty = "No reports awaiting review. All clear! ✅"
- Applications list: empty = "No testers have applied yet."
- Chat: empty = "No messages yet. Start the conversation."

---

## 12 · Accessibility Checklist

- [ ] `lang="en"` on `<html>`
- [ ] All images have descriptive `alt` text
- [ ] All form inputs have associated `<label>` elements
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Color is never the only indicator of state (also show icon/text)
- [ ] Modals trap focus and restore focus on close
- [ ] Keyboard navigation: all interactive elements reachable via Tab
- [ ] ARIA roles: `role="dialog"`, `role="alert"` for toasts, `aria-live` for dynamic updates
- [ ] Skip-nav link at page top
- [ ] Minimum contrast ratio 4.5:1 (WCAG AA) — verified against dark palette
- [ ] Severity badges include text, not just color
- [ ] Status badges: icon + text (e.g. ✅ Approved, ⏳ Pending)
- [ ] All buttons have accessible names
- [ ] Loading states announced via `aria-busy`

---

## 13 · Performance Optimization Plan

- **Code splitting**: React Router lazy() + Suspense per route group (auth / startup / tester / admin)
- **Image optimization**: Use `loading="lazy"` on all images; restrict upload size client-side (max 5MB)
- **Caching**: React Query default `staleTime: 30s`, `gcTime: 5min`
- **Bundle size**: No heavy chart libraries — use CSS-based stat bars or lightweight recharts/victory-native-equivalent
- **Font loading**: `display=swap` on Google Fonts import
- **API deduplication**: React Query deduplicates concurrent identical requests
- **Debounce**: Search inputs debounced 300ms before triggering fetch
- **Virtualization**: Not needed initially (20 items/page max via backend pagination)

---

## 14 · Folder / File Structure

```
frontend_react2/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                  ← Entry point
│   ├── App.jsx                   ← Router setup + QueryClient + AuthProvider
│   │
│   ├── assets/
│   │   └── logo.svg
│   │
│   ├── styles/
│   │   ├── index.css             ← CSS variables + reset + global base
│   │   ├── animations.css        ← Keyframes
│   │   └── utilities.css         ← Shared utility classes
│   │
│   ├── context/
│   │   └── AuthContext.jsx       ← Auth state + dispatch + provider
│   │
│   ├── services/
│   │   ├── api.js                ← Axios instance + interceptors
│   │   ├── authService.js        ← login, register, logout, me, resetPw
│   │   ├── projectService.js     ← project CRUD, submit, complete
│   │   ├── reportService.js      ← report CRUD, mark fixed, review
│   │   ├── applicationService.js ← apply, cancel, accept
│   │   └── adminService.js       ← admin stats, approve/reject, assign
│   │
│   ├── hooks/
│   │   ├── useAuth.js            ← consumes AuthContext
│   │   ├── useProjects.js        ← React Query hooks
│   │   ├── useReports.js
│   │   ├── useApplications.js
│   │   ├── useAdminStats.js
│   │   ├── useProfile.js
│   │   └── useMessages.js
│   │
│   ├── components/
│   │   ├── ui/                   ← Pure UI primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── ToastProvider.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── TagInput.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   └── StatCard.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── RootLayout.jsx    ← Sidebar + Topbar + Outlet
│   │   │   ├── AuthLayout.jsx    ← Centered card for auth pages
│   │   │   ├── Sidebar.jsx       ← Role-aware nav
│   │   │   └── Topbar.jsx        ← User info + logout
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── ProjectStatusFlow.jsx
│   │   │   └── TestingRulesEditor.jsx
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportCard.jsx
│   │   │   ├── ReportForm.jsx
│   │   │   ├── ReportDetail.jsx
│   │   │   └── AdminReportModal.jsx
│   │   │
│   │   ├── applications/
│   │   │   ├── ApplicationCard.jsx
│   │   │   └── TesterPickerModal.jsx
│   │   │
│   │   └── chat/
│   │       ├── ChatThread.jsx
│   │       └── ChatInput.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   │
│   │   ├── startup/
│   │   │   ├── StartupDashboard.jsx
│   │   │   ├── StartupProjectsPage.jsx
│   │   │   ├── CreateProjectPage.jsx
│   │   │   ├── StartupProjectDetail.jsx
│   │   │   ├── StartupReportsPage.jsx
│   │   │   └── StartupProfilePage.jsx
│   │   │
│   │   ├── tester/
│   │   │   ├── TesterDashboard.jsx
│   │   │   ├── OpenProjectsPage.jsx
│   │   │   ├── MyProjectsPage.jsx
│   │   │   ├── TesterProjectDetail.jsx
│   │   │   ├── TesterReportsPage.jsx
│   │   │   └── TesterProfilePage.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── PendingProjectsPage.jsx
│   │   │   ├── OpenProjectsAdminPage.jsx
│   │   │   ├── PendingReportsPage.jsx
│   │   │   ├── PendingUsersPage.jsx
│   │   │   └── AllTestersPage.jsx
│   │   │
│   │   └── shared/
│   │       └── ReportChatPage.jsx
│   │
│   └── utils/
│       ├── constants.js          ← STATUS_COLORS, SEVERITY_COLORS, ROUTES
│       ├── formatters.js         ← fmtDate, fmtSeverity, truncate
│       └── validators.js         ← Email, password strength, URL
│
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## 15 · Suggested Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Framework** | React 19 + Vite 8 | Already in place; fast HMR |
| **Routing** | React Router v7 | Already in place |
| **Server State** | TanStack Query v5 | Caching, revalidation, mutations out of the box |
| **HTTP Client** | Axios | Already in place; interceptors for JWT |
| **Animations** | Framer Motion | Already in place; smooth transitions |
| **Icons** | Lucide React | Already in place; consistent, tree-shakeable |
| **Charts** | Recharts | Lightweight, composable for admin stats |
| **CSS** | Vanilla CSS + CSS Variables | Per project guidelines; no Tailwind |
| **Forms** | Controlled components + custom validation | Simple enough without react-hook-form |
| **Auth State** | React Context + useReducer | Sufficient for role-based routing |
| **Linting** | ESLint (already configured) | Code quality |
| **Testing** | Vitest + React Testing Library + Playwright | See Testing Strategy section |

**Additions to install**:
```bash
npm install @tanstack/react-query recharts
npm install -D @tanstack/react-query-devtools vitest @testing-library/react @testing-library/jest-dom playwright
```

---

## 16 · Testing Strategy

### 16.1 Unit Tests (Vitest + RTL)
- All UI primitive components (`Button`, `Badge`, `Modal`, `TagInput`, etc.)
- Utility functions (`formatters.js`, `validators.js`)
- Auth reducer logic (`AuthContext` state transitions)

### 16.2 Integration Tests (RTL + MSW)
- Use **Mock Service Worker (MSW)** to mock API responses
- Login flow: invalid creds → correct creds → role-based redirect
- Register flow: role selection → form validation → success
- Project creation → status transition buttons
- Applied badge shown after applying to a project

### 16.3 E2E Tests (Playwright)
Key user journeys:
1. Startup registers → creates project → submits for approval
2. Admin approves project → assigns tester
3. Tester applies to project → submits bug report
4. Admin reviews report → approves
5. Startup marks report fixed → marks project completed
6. Password reset flow

### 16.4 Test File Co-location
```
src/components/ui/__tests__/Button.test.jsx
src/context/__tests__/AuthContext.test.jsx
src/utils/__tests__/formatters.test.js
e2e/
  startup-flow.spec.js
  tester-flow.spec.js
  admin-flow.spec.js
```

---

## 17 · Step-by-Step Build Roadmap

### Phase 0 — Foundation (Day 1)
- [ ] Install missing deps: `@tanstack/react-query`, `recharts`
- [ ] Create `src/styles/index.css` with complete design system tokens
- [ ] Create `src/styles/animations.css`
- [ ] Create `src/utils/constants.js` (routes, status colors, severity colors)
- [ ] Create `src/utils/formatters.js`
- [ ] Create `src/services/api.js` (Axios instance + interceptors)

### Phase 1 — Auth System (Day 1–2)
- [ ] `AuthContext.jsx` + `useAuth.js`
- [ ] `authService.js` (login, register, logout, me, password reset)
- [ ] `AuthLayout.jsx`
- [ ] `LoginPage.jsx`
- [ ] `RegisterPage.jsx` (multi-step with role selector)
- [ ] `ResetPasswordPage.jsx`
- [ ] Protected route wrappers per role (redirect unauthorized)

### Phase 2 — Core UI Primitives (Day 2)
- [ ] `Button`, `Input`, `Textarea`, `Select`, `Badge`, `Card`
- [ ] `Modal`, `ConfirmModal`
- [ ] `ToastProvider` + `Toast`
- [ ] `Spinner`, `Skeleton`, `EmptyState`, `ErrorState`
- [ ] `TagInput`, `FileUpload`, `SearchInput`, `Pagination`
- [ ] `StatCard`

### Phase 3 — Layout & Navigation (Day 2–3)
- [ ] `Sidebar.jsx` (role-aware nav links)
- [ ] `Topbar.jsx` (user info + logout)
- [ ] `RootLayout.jsx`
- [ ] Wire App.jsx routing: public routes + role-protected route groups

### Phase 4 — Startup Portal (Day 3–4)
- [ ] `projectService.js`
- [ ] `useProjects.js` hooks
- [ ] `StartupDashboard.jsx`
- [ ] `StartupProjectsPage.jsx` + `ProjectCard.jsx`
- [ ] `CreateProjectPage.jsx` + `ProjectForm.jsx`
- [ ] `StartupProjectDetail.jsx` (overview + applications + reports tabs)
- [ ] `StartupReportsPage.jsx` + `ReportCard.jsx`
- [ ] `StartupProfilePage.jsx`

### Phase 5 — Tester Portal (Day 4–5)
- [ ] `applicationService.js`, `reportService.js`
- [ ] `useApplications.js`, `useReports.js` hooks
- [ ] `TesterDashboard.jsx`
- [ ] `OpenProjectsPage.jsx` (browse + apply)
- [ ] `MyProjectsPage.jsx`
- [ ] `TesterProjectDetail.jsx` + `ReportForm.jsx`
- [ ] `TesterReportsPage.jsx`
- [ ] `TesterProfilePage.jsx`

### Phase 6 — Admin Portal (Day 5–6)
- [ ] `adminService.js`
- [ ] `useAdminStats.js` hook
- [ ] `AdminDashboard.jsx` with charts
- [ ] `PendingProjectsPage.jsx` + approve/reject modal
- [ ] `OpenProjectsAdminPage.jsx` + `TesterPickerModal.jsx`
- [ ] `PendingReportsPage.jsx` + `AdminReportModal.jsx`
- [ ] `PendingUsersPage.jsx`

### Phase 7 — Report Chat (Day 6)
- [ ] `useMessages.js` (poll 5s)
- [ ] `ReportChatPage.jsx` + `ChatThread.jsx` + `ChatInput.jsx`

### Phase 8 — Landing Page (Day 6–7)
- [ ] `LandingPage.jsx` — marketing hero + how-it-works + footer

### Phase 9 — Polish & QA (Day 7)
- [ ] Animate all page transitions with Framer Motion
- [ ] Audit all empty/loading/error states
- [ ] Accessibility audit (tab order, aria labels, color contrast)
- [ ] Responsive audit: mobile sidebar → bottom nav or hamburger drawer
- [ ] Test all user flows against running backend

### Phase 10 — Testing (Day 8)
- [ ] Unit tests for UI primitives
- [ ] Integration tests with MSW mocks
- [ ] E2E tests with Playwright

---

## 18 · Security Considerations (Frontend)

- **Never store sensitive data** in `sessionStorage` or global state beyond what's in `localStorage` (`access`/`refresh` tokens only)
- **XSS**: Use React's JSX rendering (auto-escapes); never use `dangerouslySetInnerHTML` except for trusted markdown with sanitization
- **CSRF**: JWT is Bearer token — not cookie based; no CSRF risk
- **Token expiry**: Access token 1 day, refresh 7 days. Axios interceptor handles silent refresh
- **Logout**: Blacklist refresh token via `POST /api/auth/logout/`; clear `localStorage`
- **Role enforcement**: Server enforces RBAC. Frontend adds UX-level guards (ProtectedRoute) but never trusts client-side role for data access
- **File uploads**: client-side `accept="image/*"` + max size check (5MB) before upload
- **Password**: min 8 chars enforced client-side + DRF enforces server-side

---

## 19 · Validation — Missing/Unclear Areas

> [!IMPORTANT]
> **Items needing your confirmation before build starts:**

1. **Charts for Admin Dashboard**: Should I use `recharts` (adds ~45KB gzipped) or keep it CSS-only (progress bars + numbers)?
2. **Forgot Password UX**: Backend sends email with link to `/reset-password?uid=&token=`. Should there also be a "Forgot Password" inline form on the Login page (to enter email → triggers POST `/api/auth/password-reset/`)?
3. **Report Chat Refresh**: Backend has no WebSocket. Use 5-second polling (auto) or manual "Refresh" button?
4. **Testing rules field**: Backend stores `testing_rules` as JSON. Should the Create Project form show a free-form textarea for JSON input, or a structured key-value pair builder?
5. **Startup can view applications but cannot accept** (only Admin can assign). Should the UI still show applications to startup (read-only list with applicant profiles)? The backend does expose `GET /api/startup/projects/:id/applications/`.
6. **Mobile breakpoint**: Sidebar collapses at what breakpoint — 768px (tablet) or 1024px? Should it be a slide-out drawer or bottom nav tabs on mobile?
7. **Frontend port**: Backend has CORS for `localhost:5173` (Vite default). Confirming we keep it at 5173.
8. **Dark mode toggle**: Is dark mode the only mode, or should we add a light mode toggle?

---

*Specification complete. Waiting for your review and confirmation before code generation begins.*
