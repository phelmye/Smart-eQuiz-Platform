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

   # Run the SQL schema into the local DB (the repository `db/supabase_schema.sql` will be used)
   docker compose -f dev/docker-compose.yml exec -T postgres sh -c "psql -U postgres -d smart_equiz_dev -f /workspace/db/supabase_schema.sql"

3. Seed sample data (locally)

   # Set your local Supabase service role and URL (DO NOT use production keys here)
   $env:SUPABASE_URL = 'https://your-project-ref.supabase.co'
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
