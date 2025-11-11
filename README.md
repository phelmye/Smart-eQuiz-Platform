# Smart eQuiz Platform

Smart eQuiz Platform is a role-based bible quiz tournament management application built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui components.

This repository contains the application source under `workspace/shadcn-ui`.

## Quickstart (development)

Prerequisites
- Node.js 18+ (LTS recommended)
- npm or pnpm (instructions below use `npm`)

Install dependencies

```powershell
Set-Location "c:\Projects\Dev\Smart eQuiz Platform\workspace\shadcn-ui"
npm install
```

Run dev server

```powershell
Set-Location "c:\Projects\Dev\Smart eQuiz Platform\workspace\shadcn-ui"
npm run dev
```

Open the URL shown in the terminal (typically http://localhost:3000 or 3003) to view the app.

## Build (production)

```powershell
Set-Location "c:\Projects\Dev\Smart eQuiz Platform\workspace\shadcn-ui"
npm run build
```

The compiled output will be placed in the `dist` or `build` folder depending on the project configuration.

## Recommended next steps (best practice)
1. Add a GitHub Actions workflow to run TypeScript checks and a build on each push/PR to `main` (CI).
2. Add basic unit/integration tests and a test runner (Jest or Vitest).
3. Create `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` to onboard collaborators.
4. Add a minimal database/mocking strategy for production seeds and integration tests.

## Repo layout
- `workspace/shadcn-ui`: main frontend application (source code, configs, scripts)
- `build/`: compiled front-end snapshots
- `cover/`, `uploads/`: binary assets and media

## Troubleshooting
- If `npm run dev` exits with an error, ensure dependencies are installed and Node version is compatible.
- If you have a nested `.git` in `workspace`, remove or convert it to a submodule if needed (this repo expects a single top-level `.git`).

## Deploying to Vercel (recommended)

Vercel is the fastest way to deploy this Vite React app with automatic preview deployments for pull requests.

1. Go to https://vercel.com and sign in with your GitHub account.
2. Click "Import Project" → choose the `phelmye/Smart-eQuiz-Platform` repository.
3. In the import settings set:
	- Root Directory: (leave empty) — we use a `vercel.json` to point at the app
	- Install command: `pnpm install`
	- Build command: `pnpm run build`
	- Output directory: `workspace/shadcn-ui/dist`
4. Add any environment variables under Project Settings → Environment Variables (for Supabase or other keys).
5. Deploy — Vercel will build and serve your app. PRs will get preview deployments automatically.

Note: This repository contains `vercel.json` which configures the static-build for the frontend located at `workspace/shadcn-ui` and routes all requests to the built `index.html` (SPA fallback).

## Contributing
If you'd like, I can add a `CONTRIBUTING.md`, set up CI, and run the dev server to fix remaining runtime issues.

---

If you want me to proceed, I recommend next to: (A) add a TypeScript + build GitHub Actions workflow, then (B) run the dev server locally and fix any runtime errors. Which should I do next? (I'll proceed automatically if you say "Go ahead".)
