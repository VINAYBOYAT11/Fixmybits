# Claude Code Handover Guide

To quickly get **Claude Code** up to speed with the **FixMyBits** project, follow these steps:

1.  **Open Claude Code** in the project root.
2.  **Paste the following "Onboarding Prompt"** into the CLI:

---

### Onboarding Prompt for Claude Code

> Hello Claude! I'm working on the **FixMyBits** project, a cybersecurity bug-bounty marketplace. 
> 
> Here is my current context:
> - **Architecture**: Django (backend) + React/Vite (frontend).
> - **Goal**: Integrate the `Landing page design` with the `backend` API and apply premium "Antigravity" aesthetics.
> - **Source of Truth**: Read `docs/PROJECT_CONTEXT.md` and `docs/Pasted markdown.md` for full project specs and progress.
> - **Navigation**: Use the `/graphify` slash command to understand the codebase structure. I have already installed the Graphify agent rules in `.agent/`.
> - **Current Task**: We are in the middle of integrating `LoginPage.tsx` with the JWT auth endpoints at `/api/auth/login/`.
> 
> Please audit the project root and let me know your thoughts on the next steps for the frontend-backend integration.

---

### How to use Graphify with Claude Code
The project is set up with **Graphify** rules. You can use:
- `/graphify update .` to rebuild the knowledge graph.
- `/graphify query <concept>` to find relevant code sections.

The graph data and reports are stored in `graphify-out/`.
