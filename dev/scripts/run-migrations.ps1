Write-Output "Running DB migrations against local Postgres container..."

# Ensure the docker-compose stack is up
docker compose -f dev/docker-compose.yml up -d

Write-Output "Applying db/supabase_schema.sql to smart_equiz_dev database"
docker compose -f dev/docker-compose.yml exec -T postgres sh -c "psql -U postgres -d smart_equiz_dev -f /workspace/db/supabase_schema.sql"

if ($LASTEXITCODE -ne 0) { Write-Error "Migration command failed with exit code $LASTEXITCODE"; exit $LASTEXITCODE }
Write-Output "Migrations applied."
