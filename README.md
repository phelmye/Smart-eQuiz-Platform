# Smart eQuiz Platform

Smart eQuiz Platform is a role-based quiz and tournament management application built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui components.

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

## Contributing
If you'd like, I can add a `CONTRIBUTING.md`, set up CI, and run the dev server to fix remaining runtime issues.

---

If you want me to proceed, I recommend next to: (A) add a TypeScript + build GitHub Actions workflow, then (B) run the dev server locally and fix any runtime errors. Which should I do next? (I'll proceed automatically if you say "Go ahead".)
