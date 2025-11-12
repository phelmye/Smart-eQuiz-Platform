# Admin backend (minimal)

This is a small, intentionally minimal admin backend used for running dev/staging-only admin tasks like migrations and seeding.

Safety notes
- Do NOT set `RUN_MIGRATE_CMD` or `RUN_SEED_CMD` in production environments unless you are sure.
- Protect the service with a strong `ADMIN_TOKEN`.
- `CHECK_MIGRATE` must be set to `true` to allow `/admin/migrate` to execute.

Usage (local)
1. Copy `.env.example` to `.env` and edit values.
2. Start with `npm ci` and `npm run dev` inside `services/admin-backend`.
3. Call endpoints:

```
curl -H "x-admin-token: $ADMIN_TOKEN" -X POST http://localhost:4000/admin/seed
curl -H "x-admin-token: $ADMIN_TOKEN" -X POST http://localhost:4000/admin/migrate
```
Local end-to-end test (safe)
1. Open a PowerShell terminal in the repository root.
2. Start the DB/support services (this will NOT start the admin-backend container):

```powershell
docker compose -f dev/docker-compose.yml up -d postgres redis adminer
```

3. Start the admin-backend on your host with safe env values (do NOT use production service keys):

```powershell
#$env:ADMIN_TOKEN='local-admin-token'
#$env:CHECK_MIGRATE='true' # set to true only when you intend to run migrations
#$env:RUN_MIGRATE_CMD='powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "& { . \"./dev/scripts/run-migrations.ps1\" -UseLocalAuthStub:$true }"'
#$env:RUN_SEED_CMD='node ./scripts/run-seed.mjs --local'
#node services/admin-backend/src/index.js
```

4. Use the provided helper to call endpoints (the helper reads `ADMIN_TOKEN` from env or accepts `-token`):

```powershell
# health
.\services\admin-backend\dev-call.ps1 -action health

# run migrations (will only run if CHECK_MIGRATE is true in the process that started the server)
.\services\admin-backend\dev-call.ps1 -action migrate -token 'local-admin-token'

# run seed (runs RUN_SEED_CMD configured in the host process)
.\services\admin-backend\dev-call.ps1 -action seed -token 'local-admin-token'
```

Important safety notes
- Never set `RUN_MIGRATE_CMD` or `RUN_SEED_CMD` in a production environment or in a container that is reachable from the public internet.
- Keep your `ADMIN_TOKEN` secret. For CI, use repository secrets and avoid enabling migration/seed commands unless needed.
- The admin-backend by default will not execute migration/seed commands until `RUN_*` vars are set in the process environment that runs the server.

Seeding Supabase (non-local)
--------------------------------
If you want to run the seeder directly against a Supabase project (non-local), you can use the repository script and the verifier:

1. Set these environment variables (use only for a staging/dev Supabase project):

```powershell
$env:SUPABASE_URL = 'https://your-project.supabase.co'
$env:SUPABASE_SERVICE_ROLE = 'service-role-key'
```

2. Run the seeder and then verification locally:

```powershell
# runs scripts/run-seed.mjs (Supabase client path) then scripts/verify-seed.mjs
node .\scripts\seed-and-verify.mjs
```

Note: `scripts/run-seed.mjs` dynamically imports `@supabase/supabase-js` at runtime. If you plan to run the Supabase client path, ensure you have `@supabase/supabase-js` available in your environment (install it globally or in the repo):

```powershell
npm install @supabase/supabase-js
```

