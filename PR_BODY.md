Title: ci(workflows): add guarded manual auth migration & seed smoke workflow

Description

This PR introduces a guarded, manual GitHub Actions workflow to validate auth-related database migrations and seeding in a controlled CI environment.

Why

- Ensures that Prisma migrations and the demo seed operate successfully in a CI-like environment.
- Provides a reproducible smoke test for auth flows (login -> refresh -> /users/me) without running automatically on every push (manual `workflow_dispatch`).
- Captures logs and artifacts to make debugging failures straightforward.

What changed

- `.github/workflows/ci-auth-smoke.yml` — canonical manual workflow that:
  - Starts Postgres + Redis via `dev/docker-compose.yml`.
  - Runs the `api-init` one-shot container which executes `prisma migrate reset` and seeds demo data.
  - Builds and starts the `api` container.
  - Waits for API readiness and runs `services/api/test/e2e/auth.e2e.js` from the runner.
  - Uploads `auth-e2e.log` and `api-init.log` on success; uploads docker logs on failure.
- `.github/workflows/ci-auth-smoke-clean.yml` — backup clean copy (kept for safety during iteration).
- `dev/run-init.ps1`, `dev/docker-compose.yml` — helper and compose definitions used by developers to reproduce the same flow locally.

Local verification performed (by me)

- Ran `dev/run-init.ps1`: migrations applied and seed created demo tenant and admin (admin@demo.local).
- Ran auth E2E harness with RETURN_REFRESH_IN_BODY=true: login → refresh → /users/me (passed).
- Generated Prisma client and built API (services/api): `pnpm run prisma:generate`, `pnpm run build` (Nest build succeeded).
- Built UI (workspace/shadcn-ui): `pnpm run build` (Vite production build succeeded).
- Ran ESLint (UI) and TypeScript checks (UI & API): `npx tsc -p tsconfig.json --noEmit` — no type errors printed.

Safety notes

- `api-init` runs `prisma migrate reset` (destructive) — this workflow is intended for dev/CI-only usage. Do NOT run against production databases.
- Workflow is manual (`workflow_dispatch`) so it will not run automatically on PRs unless triggered.

How to run locally (dev)

1. Start dev stack and run init (Windows PowerShell):

```powershell
Set-Location -Path "C:\Projects\Dev\Smart eQuiz Platform"
.\dev\run-init.ps1
```

2. Run the E2E harness locally (if you prefer to run against a running API):

```powershell
Set-Location -Path "C:\Projects\Dev\Smart eQuiz Platform"
$env:RETURN_REFRESH_IN_BODY = 'true'
node services/api/test/e2e/auth.e2e.js | Tee-Object auth-e2e.log
```

CI/Reviewer checklist (what to watch for when you run in Actions)

- [ ] `api-init.log` shows migrations applied and seed completed (look for "Seed complete")
- [ ] `auth-e2e.log` shows login returned access and refresh tokens, refresh returned an access token, and /users/me returns the demo admin user
- [ ] If failing, download and inspect docker logs artifacts (api, postgres, redis) plus `api-init.log` and `auth-e2e.log`
- [ ] Confirm the workflow did not run automatically (it must be triggered manually for the first run)

If you want me to push and open the PR

- I will not push unless you explicitly instruct me to. When you say "push and open PR", tell me the target branch (default branch if you'd like me to infer it) and whether you want the commits squashed first.

Notes

- I kept `ci-auth-smoke-clean.yml` as a backup in the repo. If you'd like, I can remove the backup before pushing.

---

(Generated locally by automation; no remote pushes were made.)