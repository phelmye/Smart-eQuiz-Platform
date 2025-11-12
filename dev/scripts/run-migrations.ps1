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
$hostSqlPath = Join-Path -Path (Resolve-Path -Path "..\..\db\supabase_schema.sql") -ChildPath ''
$hostSqlPath = $hostSqlPath.TrimEnd("\")
if (-not (Test-Path $hostSqlPath)) {
	Write-Error "Local SQL file not found at $hostSqlPath"
	exit 3
}

Write-Output "Copying SQL file into container $containerId:/tmp/supabase_schema.sql"
docker cp $hostSqlPath "$containerId":/tmp/supabase_schema.sql
if ($LASTEXITCODE -ne 0) { Write-Error "docker cp failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }

Write-Output "Running psql inside container"
docker exec -i $containerId sh -c "psql -U postgres -d smart_equiz_dev -f /tmp/supabase_schema.sql"
if ($LASTEXITCODE -ne 0) { Write-Error "Migration command inside container failed with exit code $LASTEXITCODE"; exit $LASTEXITCODE }
Write-Output "Migrations applied."
