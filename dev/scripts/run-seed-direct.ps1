# Run simple INSERTs directly against the local Postgres container without using Supabase client
param(
  [string]$DbUser = 'postgres',
  [string]$DbName = 'smart_equiz_dev'
)

Write-Output "Seeding demo data directly into local Postgres container ($DbName)"

$composePath = Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath "..\docker-compose.yml") -ErrorAction SilentlyContinue
if (-not $composePath) { Write-Error "Could not resolve dev/docker-compose.yml from script location ($PSScriptRoot)"; exit 2 }
$containerId = docker compose -f "$($composePath.Path)" ps -q postgres
if (-not $containerId) { Write-Error "Could not find postgres container"; exit 2 }

# Simple SQL to insert a demo tournament and two questions, returning ids
# Build a SQL file and copy it into the container to avoid quoting issues
$tmpFile = Join-Path -Path $PSScriptRoot -ChildPath "tmp_seed.sql"
$sqlContent = @'
INSERT INTO tournaments (title, description, created_at) VALUES ('Demo Tournament', 'Seeded sample tournament', now());

INSERT INTO questions (prompt, choices, created_at) VALUES
  ('What is 2 + 2?', '[{"id":1,"text":"3"},{"id":2,"text":"4","correct":true}]'::jsonb, now()),
  ('What color is the sky?', '[{"id":1,"text":"Green"},{"id":2,"text":"Blue","correct":true}]'::jsonb, now());

-- Optionally link the first two questions to the tournament
-- This assumes the first tournament id and question ids; for demo simplicity we skip FK mappings here
'@

Set-Content -Path $tmpFile -Value $sqlContent -Encoding UTF8

Write-Output "Copying seed SQL into container ${containerId}:/tmp/seed.sql"
docker cp $tmpFile "${containerId}:/tmp/seed.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "docker cp failed (exit $LASTEXITCODE)"; Remove-Item -Force $tmpFile -ErrorAction SilentlyContinue; exit $LASTEXITCODE }

Write-Output "Running seed SQL inside container"
docker exec -i $containerId psql -U $DbUser -d $DbName -f /tmp/seed.sql
if ($LASTEXITCODE -ne 0) { Write-Error "Seed command inside container failed with exit code $LASTEXITCODE"; Remove-Item -Force $tmpFile -ErrorAction SilentlyContinue; exit $LASTEXITCODE }

Remove-Item -Force $tmpFile -ErrorAction SilentlyContinue

Write-Output "Seed completed. You can inspect data in Adminer at http://localhost:8080 (login: postgres / postgres)."