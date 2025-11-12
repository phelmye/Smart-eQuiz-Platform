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
