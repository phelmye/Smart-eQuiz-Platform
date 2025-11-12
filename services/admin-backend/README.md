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
