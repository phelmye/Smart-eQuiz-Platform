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
docker compose -f dev/docker-compose.yml exec -T postgres sh -c "psql -U postgres -d smart_equiz_dev -f /workspace/db/supabase_schema.sql"

if ($LASTEXITCODE -ne 0) { Write-Error "Migration command failed with exit code $LASTEXITCODE"; exit $LASTEXITCODE }
Write-Output "Migrations applied."
