# Smart eQuiz API (scaffold)

This is a minimal NestJS + Prisma scaffold to start Milestone A: Auth + Multi-tenancy.

Quick start (after you install dependencies):

1. cd services/api
2. npm install
3. set DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_equiz_dev?schema=public"
4. npm run prisma:generate
5. npm run prisma:migrate -- --name init
6. npm run seed
7. npm run start:dev

Notes:
- This scaffold is intentionally minimal: implement further modules (tournament, practice, payments) as separate NestJS modules.
- Keep branches local until CI stability confirmation per project policy.
