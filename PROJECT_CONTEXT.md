# Project Context: FixMyBits

## 🎯 Project Goal
**FixMyBits** is a non-profit, role-based cybersecurity marketplace connecting:
- **Startups**: Submit projects for security testing.
- **Testers**: Security researchers who find and report bugs.
- **Admins**: Moderate the platform, approve projects, and assign testers.

## 🛠️ Technology Stack
- **Backend**: Django 4.2, Django REST Framework (DRF), SimpleJWT (Auth), PostgreSQL/SQLite, Celery (Tasks).
- **Frontend**: React (Vite), React Router v7, motion/react (Animations), Vanilla CSS (Design system).
- **Tooling**: Graphify (Knowledge Graph engine for codebase navigation).

## 📂 Key Directory Structure
- `/backend`: Django root. Local apps in `apps/` (users, projects, reports).
- `/Landing page design`: React frontend root.
- `/graphify-out`: Knowledge graph reports and visualizations.
- `/.agent`: Slash commands and rules for AI assistants (including `/graphify`).

## 🔗 Current Integration Status
- **Authentication**: Backend has full JWT auth on `/api/auth/`. Frontend has a basic `api.ts` and `LoginPage.tsx` requiring final integration hooks.
- **Design System**: Harmonized CSS variables are being applied to `theme.css`. Premium "Antigravity" aesthetics (glassmorphism, vibrant colors) are the target.
- **Logic**: Role-based access control (RBAC) is implemented on the backend; the frontend needs to handle role-aware redirects.

## 🤖 AI Assistance & Tooling
- **Graphify**: Use `/graphify update .` to rebuild the knowledge graph.
- **Graph Report**: Refer to `graphify-out/GRAPH_REPORT.md` for a map of "God Nodes" (Application, Project, UserSerializer) and community hubs.
- **Specification**: Full product spec is in `Pasted markdown.md`.

## 🚀 Next Steps
1. Complete integration of `LoginPage.tsx` with the backend auth.
2. Apply full design system markers to the `Landing page design` components.
3. Implement basic role-aware dashboards for Startups and Testers.
