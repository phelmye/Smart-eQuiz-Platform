READY FOR PUSH - pr/ci-auth-smoke-ready

Branch: pr/ci-auth-smoke-ready (local only)

Commits (top):
- 9c91f51 chore(ci): remove backup ci-auth-smoke-clean.yml (kept canonical ci-auth-smoke.yml)
- 5e2bdbe docs(ci): add PR body + draft for guarded auth smoke workflow
- 27ba002 ci(workflows): add validated ci-auth-smoke.yml (manual auth smoke)

Checks run locally:
- Dev stack init + api-init (migrations applied, seed completed)
- Auth E2E harness: PASS
- Prisma generate: OK
- API build (Nest): OK
- UI build (Vite): OK
- ESLint: ran in UI (no reported errors with --quiet)
- TypeScript: tsc --noEmit in UI and API (no errors printed)

Notes before pushing:
- The workflow is manual (`workflow_dispatch`) so it must be triggered manually in Actions.
- `api-init` is destructive (runs `prisma migrate reset`); do not run against production.
- Untracked local artifact: `auth-e2e.log` (kept locally).

If you'd like me to push and open the PR, say: "push and open PR" and specify the target branch (default branch if omitted). I will not push without explicit permission.
