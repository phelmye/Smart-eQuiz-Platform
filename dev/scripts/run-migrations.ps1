<#
Usage: .\dev\scripts\run-migrations.ps1 [-UseLocalAuthStub <$true|$false>]

Options:
	-UseLocalAuthStub  When true (default) the script will create a minimal `auth.users` table
										 and the `pgcrypto` extension in the local Postgres container so
										 the Supabase schema that references `auth.users` can be applied
										 on a plain Postgres instance used for local development.

Set `-UseLocalAuthStub $false` when running migrations against a real Supabase
instance (DO NOT apply the auth stub in production).
#>
param(
		[bool]$UseLocalAuthStub = $true
)

Write-Output "Running DB migrations against local Postgres container..."

# Check that Docker is available
try {
	docker info > $null 2>&1
	if ($LASTEXITCODE -ne 0) { throw "Docker daemon not reachable" }
} catch {
	Write-Error "Docker does not appear to be running or accessible. Please start Docker Desktop (or ensure the Docker daemon is running) and try again.";
	Write-Error "On Windows: start Docker Desktop from the Start Menu and wait until it reports 'Docker is running'."
	exit 1
}

Write-Output "Starting docker-compose dev stack..."
docker compose -f dev/docker-compose.yml up -d
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to start docker-compose stack (exit $LASTEXITCODE). Ensure Docker is running and you have permissions."; exit $LASTEXITCODE }

Write-Output "Applying db/supabase_schema.sql to smart_equiz_dev database"

# Resolve container id for the postgres service created by docker compose
$containerId = docker compose -f dev/docker-compose.yml ps -q postgres
if (-not $containerId) {
	Write-Error "Could not find running postgres container via docker compose."
	exit 2
}

# Copy the SQL file into the container to avoid relying on host bind mounts
# Resolve path relative to this script file (works no matter current working directory)
$relativePath = Join-Path -Path $PSScriptRoot -ChildPath "..\..\db\supabase_schema.sql"
$resolved = Resolve-Path -Path $relativePath -ErrorAction SilentlyContinue
if (-not $resolved) {
	Write-Error "Local SQL file not found at path (looked for) $relativePath"
	exit 3
}
$hostSqlPath = $resolved.Path
$hostSqlPath = $hostSqlPath.TrimEnd("\")

Write-Output "Copying SQL file into container ${containerId}:/tmp/supabase_schema.sql"
docker cp $hostSqlPath "${containerId}:/tmp/supabase_schema.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "docker cp failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }

Write-Output "Running psql inside container"
# Ensure minimal Supabase-like environment for local dev: pgcrypto extension and auth.users stub
Write-Output "Creating local helpers: pgcrypto extension and auth.users stub (if missing)"
$prepSql = "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE SCHEMA IF NOT EXISTS auth; CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY);"
docker exec -i $containerId psql -U postgres -d smart_equiz_dev -c "$prepSql"
if ($LASTEXITCODE -ne 0) { Write-Error "Pre-migration helper command failed with exit code $LASTEXITCODE"; exit $LASTEXITCODE }

docker exec -i $containerId sh -c "psql -U postgres -d smart_equiz_dev -f /tmp/supabase_schema.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "Migration command inside container failed with exit code $LASTEXITCODE"; exit $LASTEXITCODE }
Write-Output "Migrations applied."
