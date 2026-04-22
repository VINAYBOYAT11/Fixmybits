# FixMyBits — Frontend

React + TypeScript frontend for the FixMyBits cybersecurity marketplace.

## Structure

```
src/
├── app/
│   ├── components/
│   │   ├── shared/          # ReportChat, Sidebar, StatusBadge
│   │   ├── ui/              # shadcn/ui components
│   │   ├── figma/           # Figma-generated components
│   │   ├── DashboardLayout  # Authenticated page wrapper
│   │   ├── Navbar           # Landing page navbar
│   │   ├── Hero             # Landing page hero section
│   │   ├── Features         # Landing page features
│   │   ├── HowItWorks       # Landing page how-it-works
│   │   ├── ImpactStats      # Landing page stats
│   │   ├── CTA              # Landing page call-to-action
│   │   ├── Footer           # Landing page footer
│   │   └── ...              # Other landing page sections
│   ├── lib/
│   │   ├── api.ts           # All API calls (fetch wrapper + auto-refresh)
│   │   └── auth.ts          # Token storage, requireAuth guard
│   └── pages/
│       ├── admin/           # AdminDashboard, AdminProjects, AdminReports, AdminUsers, AdminApplications
│       ├── startup/         # StartupDashboard, ProjectsList, NewProject, ProjectDetail, AllReports, StartupProfile
│       ├── tester/          # TesterDashboard, OpenProjects, MyProjects, TesterProjectDetail, MyReports, TesterProfile
│       ├── LoginPage
│       ├── RegisterPage
│       ├── ForgotPasswordPage
│       ├── ResetPasswordPage
│       └── ContactPage
├── assets/                  # Static images
├── imports/                 # Imported design assets
├── styles/                  # Global CSS, Tailwind, theme
└── main.tsx                 # Entry point
```

## Setup

```bash
npm install
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```

## Environment Variables

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `VITE_API_BASE_URL` | Backend API base URL (no trailing /) |

## Available Scripts

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start dev server (port 5173)   |
| `npm run build` | Production build to `dist/`    |
| `npm run preview` | Preview production build     |

## Routing

The app uses `react-router-dom` v7. Routes are defined in `main.tsx`.

| Path                          | Component              | Auth  |
|-------------------------------|------------------------|-------|
| `/`                           | Landing page (App.tsx) | No    |
| `/login`                      | LoginPage              | No    |
| `/register`                   | RegisterPage           | No    |
| `/forgot-password`            | ForgotPasswordPage     | No    |
| `/reset-password`             | ResetPasswordPage      | No    |
| `/contact`                    | ContactPage            | No    |
| `/startup/dashboard`          | StartupDashboard       | startup |
| `/startup/projects`           | ProjectsList           | startup |
| `/startup/projects/new`       | NewProject             | startup |
| `/startup/projects/:id`       | ProjectDetail          | startup |
| `/startup/reports`            | AllReports             | startup |
| `/startup/profile`            | StartupProfile         | startup |
| `/tester/dashboard`           | TesterDashboard        | tester |
| `/tester/projects/open`       | OpenProjects           | tester |
| `/tester/projects/mine`       | MyProjects             | tester |
| `/tester/projects/:id`        | TesterProjectDetail    | tester |
| `/tester/reports`             | MyReports              | tester |
| `/tester/profile`             | TesterProfile          | tester |
| `/admin/dashboard`            | AdminDashboard         | admin  |
| `/admin/users`                | AdminUsers             | admin  |
| `/admin/projects`             | AdminProjects          | admin  |
| `/admin/reports`              | AdminReports           | admin  |
| `/admin/applications`         | AdminApplications      | admin  |

## Auth Flow

1. User logs in → tokens stored in `localStorage` (`fixmybits_access_token`, `fixmybits_refresh_token`, `fixmybits_user`)
2. Every authenticated request sends `Authorization: Bearer <token>`
3. On 401, the client auto-refreshes using the refresh token
4. `requireAuth(role)` in `DashboardLayout` redirects unauthenticated users to `/login`

## Key Libraries

| Library          | Purpose                          |
|------------------|----------------------------------|
| `motion/react`   | Animations                       |
| `lucide-react`   | Icons                            |
| `tailwindcss`    | Utility CSS                      |
| `@radix-ui`      | Accessible UI primitives         |
| `react-router`   | Client-side routing              |
| `recharts`       | Charts (used in admin dashboard) |
| `sonner`         | Toast notifications              |
