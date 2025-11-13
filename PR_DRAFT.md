PR Draft: Guarded CI auth smoke

Summary

This change adds a guarded, manual GitHub Actions workflow that runs the auth migration + seed smoke test locally in CI. The workflow performs:

- Bring up Postgres + Redis using `dev/docker-compose.yml`.
- Run the one-shot `api-init` container which runs `prisma migrate reset` and seeds demo data.
- Build and start the `api` container.
- Wait for the API and run the auth E2E harness from the runner (host) against `http://localhost:3000`.
- Upload auth logs on success and docker logs on failure.

Files of interest

- `.github/workflows/ci-auth-smoke.yml` — validated manual workflow (canonical)
- `.github/workflows/ci-auth-smoke-clean.yml` — backup clean copy
- `dev/run-init.ps1` — Windows helper to bring up compose, run `api-init`, and start `api`.
- `services/api/prisma/*` — migrations including `add_refresh_token` and seed files.
- `services/api/test/e2e/auth.e2e.js` — the E2E harness run by the workflow.

What I ran locally (verification)

- Started dev stack and ran `api-init` (applied migrations + seeded demo tenant).
- Ran the auth E2E harness: login → refresh → /users/me (passed).
- Generated Prisma client and built API: `pnpm run prisma:generate` + `pnpm run build` (services/api).
- Built UI: `pnpm run build` in `workspace/shadcn-ui`.
- Ran `eslint` in `workspace/shadcn-ui` and `tsc --noEmit` in both `workspace/shadcn-ui` and `services/api`.

Local branch

- `pr/ci-auth-smoke-ready` contains the validated workflow and supporting changes. No pushes performed.

Next steps (recommended)

- When you're ready, push `pr/ci-auth-smoke-ready` and open a PR to the default branch; the workflow is `workflow_dispatch` (manual) so it won't run automatically without manual trigger.
- Review CI run artifacts on failure: `api-init.log`, `auth-e2e.log`, and Docker logs.

Notes & Safety

- `api-init` runs `prisma migrate reset` (destructive) — only target dev environment and ensure backups if this were used elsewhere.
- I did not push or open any PR until you explicitly ask.

If you want, I can:
- Squash workflow edits into a single commit (local-only) before push.
- Push and open the PR for you.
- Add a lightweight GitHub Actions 