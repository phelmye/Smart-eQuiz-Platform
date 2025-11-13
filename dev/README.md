# Dev local stack and init

This document covers the local-first dev workflow used by the project: starting the local stack, running the one-shot `api-init` that applies migrations and seeds demo data, and running the auth E2E harness.

Important: These scripts are destructive by design (they call `prisma migrate reset`) — only run them against local development Postgres instances. Do NOT point them at production or shared databases.

Windows (PowerShell) quickstart

1. From the repo root, start the stack and run the one-shot init (recommended for Windows):

```powershell
Set-Location -Path "C:\Projects\Dev\Smart eQuiz Platform"
.\dev\run-init.ps1
```

What `run-init.ps1` does:
- Brings up Postgres (and Redis/adminer) from `dev/docker-compose.yml`.
- Waits for Postgres readiness.
- Runs the `api-init` one-shot container which executes `prisma migrate reset --force` and seeds demo data.
- Starts the `api` container (built from `services/api/Dockerfile`) listening on port 3000.

Manual alternative (Linux / macOS / CI runners)

```bash
docker compose -f dev/docker-compose.yml up -d postgres redis
# wait for postgres to be ready (use pg_isready or a loop)
docker compose -f dev/docker-compose.yml run --rm api-init
docker compose -f dev/docker-compose.yml up --build -d api
```

Run the auth E2E harness (host runner)

Once the API is up on http://localhost:3000 you can run the simple Node E2E harness that performs login → refresh → /users/me. From the repo root:

```bash
node services/api/test/e2e/auth.e2e.js
```

The harness expects the demo seed user `admin@demo.local` to exist (that is created by `api-init`). You can toggle dev helper behavior by setting `RETURN_REFRESH_IN_BODY=true` in the environment when running the client harness.

Notes & safety
- `api-init` will reset the database. Use only on local dev databases created by the compose file.
- The CI workflow `/.github/workflows/ci-auth-smoke.yml` is intentionally manual (`workflow_dispatch`) and guarded. Review it before enabling as an automated step in your repo.

If anything fails, collect `docker compose logs api postgres` and paste the logs when reporting the issue.
Local development infrastructure (non-production)

This folder contains a lightweight Docker Compose setup and helper scripts to run a local development stack without touching production resources.

Services provided
- Postgres (smart_equiz_dev) — 5432
- Redis — 6379
- Adminer (DB web UI) — 8080

Quick start (PowerShell)

1. Start the local stack

   # from repo root
   docker compose -f dev/docker-compose.yml up -d

2. Apply DB schema

   There are helper scripts included that make this easier and safer on Windows:

   # Start the dev stack (run from repo root)
   docker compose -f dev/docker-compose.yml up -d

   # Run migrations (default applies a small local auth stub so FKs to `auth.users` succeed)
   .\dev\scripts\run-migrations.ps1

   # If you are targeting a real Supabase instance (DO NOT use the local auth stub), run:
   .\dev\scripts\run-migrations.ps1 -UseLocalAuthStub:$false

3. Seed sample data (locally)

   Option A — direct SQL seeding (no Supabase client required):

   # Copies a small SQL file into the Postgres container and executes it
   .\dev\scripts\run-seed-direct.ps1

   Option B — use the Supabase client seeder (requires a Supabase URL + service role key):

   # Set the env vars (local only) and run the Node seeder
   $env:SUPABASE_URL = 'http://localhost:5432' # or your Supabase URL
   $env:SUPABASE_SERVICE_ROLE = 'service-role-key-for-local'
   node .\scripts\run-seed.mjs

Notes
- The Postgres container mounts the repo at `/workspace` so the SQL file is visible to the container.
- Do NOT run these scripts against production. This local stack is for development and staging testing only.
- To stop and remove volumes:

   docker compose -f dev/docker-compose.yml down -v

Helpful commands

  # tail Postgres logs
  docker compose -f dev/docker-compose.yml logs -f postgres

  # open Adminer in the browser
  http://localhost:8080

Optional: reset DB and seed (one-shot)

If you want to reset the local dev database and seed demo data, an opt-in one-shot service `api-init` is available in `dev/docker-compose.yml`.

Run it explicitly (this will drop and recreate data):

```powershell
# from repo root
docker compose -f .\dev\docker-compose.yml up --build api-init
```

Notes:
- `api-init` is intentionally not started by the default `up -d` flow so you don't accidentally wipe local data.
- Use `docker compose -f dev/docker-compose.yml down -v` to remove volumes and fully reset state.
