CI compose override and local run notes

Why CI uses a different Postgres image

- Local development uses `postgres:15-alpine` in `dev/docker-compose.yml`. This image is small and fast for local machines.
- GitHub-hosted runners have shown intermittent readiness/shutdown behavior with the Alpine variant during CI runs (initdb → ready → fast shutdown). To stabilize CI we provide a CI-only compose override that switches Postgres to the Debian-based image `postgres:15`.

Files

- `dev/docker-compose.yml` — developer compose stack (default, uses `postgres:15-alpine`).
- `dev/docker-compose.ci.yml` — CI-only override (uses `postgres:15`), intended only for CI runs on GitHub-hosted runners.

How CI uses the override

Workflows under `.github/workflows/` start the stack with:

  docker compose -f dev/docker-compose.yml -f dev/docker-compose.ci.yml up -d --wait

This ensures the non-Alpine Postgres image runs in CI without changing local developer behavior.

How to run the stack locally (recommended)

- Standard local run (developer default):

  docker compose -f dev/docker-compose.yml up -d --wait

- If you want to simulate CI (use the same Postgres image as CI):

  docker compose -f dev/docker-compose.yml -f dev/docker-compose.ci.yml up -d --wait

Notes and troubleshooting

- If you see Postgres repeatedly start then stop in CI, check the following in order:
  1. Docker logs for the Postgres container: `docker logs <container>`
  2. Disk-space and volume permissions on the host runner
  3. The `dev/docker-compose.ci.yml` override — CI may use a different entrypoint or image runtime behavior

- We intentionally do not change the developer compose file to keep local image sizes small and fast. The CI override is the minimal divergence to stabilize hosted-runner behavior.

When stable

- Once the nightly/PR smoke tests consistently pass without failures, consider removing verbose failure-only debug artifact collection from workflows to reduce noise and storage usage.
