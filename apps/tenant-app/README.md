# Shadcn-UI Template Usage Instructions

## technology stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

All shadcn/ui components have been downloaded under `@/components/ui`.

## File Structure

- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration file
- `tailwind.config.js` - Tailwind CSS configuration file
- `package.json` - NPM dependencies and scripts
- `src/app.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Existing CSS configuration
- `src/pages/Index.tsx` - Home page logic

## Components

- All shadcn/ui components are pre-downloaded and available at `@/components/ui`

## Styling

- Add global styles to `src/index.css` or create new CSS files as needed
- Use Tailwind classes for styling components

## Development

- Import components from `@/components/ui` in your React components
- Customize the UI by modifying the Tailwind configuration

## Note

- The `@/` path alias points to the `src/` directory
- In your typescript code, don't re-export types that you're already importing

# Commands

**Install Dependencies**

```shell
pnpm i
```

**Add Dependencies**

```shell
pnpm add some_new_dependency

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```

## Supabase (optional)

This project can connect to a Supabase Postgres backend for auth, storage and database features. A quick setup:

1. Create a Supabase project at https://app.supabase.com and create your tables.
2. Copy `.env.example` to `.env` and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
3. Add the same env vars to your Vercel project (Vite expects VITE_ prefixed variables for client-side access).
4. Use the client exported from `src/lib/supabaseClient.ts` anywhere in the app.

Example usage:

```ts
import { supabase } from '@/lib/supabaseClient';

const { data, error } = await supabase.from('tournaments').select('*');
```
Seeding and schema
------------------

1. Run the SQL schema in `db/supabase_schema.sql` from the Supabase SQL editor to create the initial tables.
2. If you want to seed demo data from the server, deploy the serverless function `api/seed-supabase.ts` (Vercel) and set the following server envs:

	- `SUPABASE_URL` (same as VITE_SUPABASE_URL)
	- `SUPABASE_SERVICE_ROLE` (service role key — keep this secret)

	Then call the endpoint `/api/seed-supabase` once to insert demo records.

Security note: never commit `SUPABASE_SERVICE_ROLE` to source or store it in client envs. Use the hosting provider's secret environment variables for server-only keys.

Security note: never commit service_role keys or expose them to the browser. Use serverless functions for privileged operations.

