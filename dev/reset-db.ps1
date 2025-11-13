<#
.SYNOPSIS
  Reset the local `smart_equiz_dev` database: drop, recreate, run base schema and migrations, and optionally seed.

USAGE
  .\dev\reset-db.ps1 [-Seed] [-UseCiImage]

  -Seed : Run the local seeder after migrations (default: $true)
  -UseCiImage : Use the CI compose override (postgres:15) when bringing up the stack

#>

param(
    [switch]$Seed = $true,
    [switch]$UseCiImage = $false
)

$composeFiles = @('dev/docker-compose.yml')
if ($UseCiImage) { $composeFiles += 'dev/docker-compose.ci.yml' }

Write-Host "Resetting smart_equiz_dev (UseCiImage=$UseCiImage)"

# Start minimal stack
$composeArgs = ($composeFiles | ForEach-Object { "-f `"$_`"" }) -join ' '
Write-Host "Starting compose: docker compose $composeArgs up -d postgres redis adminer"
Invoke-Expression "docker compose $composeArgs up -d postgres redis adminer"

# Get postgres container id
$container = (Invoke-Expression "docker compose $composeArgs ps -q postgres").Trim()
if (-not $container) {
    Write-Error "Could not find postgres container id"
    exit 1
}
Write-Host "Postgres container: $container"
# Wait for Postgres to be ready
$ok = $false
for ($i = 0; $i -lt 60; $i++) {
    & docker exec -i $container pg_isready -U postgres -d postgres > $null 2>&1
    if ($LASTEXITCODE -eq 0) { $ok = $true; break }
    Write-Host "Waiting for postgres to be ready... ($i)"
    Start-Sleep -Seconds 2
}
if (-not $ok) {
    Write-Error "Postgres did not become ready in time"
    exit 1
}

# Drop and recreate DB
Write-Host "Dropping database if exists..."
docker exec -i $container psql -U postgres -c "DROP DATABASE IF EXISTS smart_equiz_dev;" | Write-Host
Write-Host "Creating database..."
docker exec -i $container psql -U postgres -c "CREATE DATABASE smart_equiz_dev;" | Write-Host

# Run migrations using existing runner (Windows-aware)
$localRunner = Join-Path $PSScriptRoot '..\dev\scripts\run-migrations.ps1'
if (Test-Path $localRunner) {
    Write-Host "Running migrations via $localRunner"
    powershell -NoProfile -ExecutionPolicy Bypass -File $localRunner
} else {
    Write-Host "Migration runner not found at $localRunner; attempting to apply supabase_schema.sql directly"
    & docker cp "db/supabase_schema.sql" ($container + ':/tmp/supabase_schema.sql')
    & docker exec -i $container psql -U postgres -d smart_equiz_dev -f /tmp/supabase_schema.sql
    foreach ($f in Get-ChildItem -Path db/migrations -Filter '*.sql' | Sort-Object Name) {
        $base = $f.Name
        if ($base -like '*rls*') { Write-Host "Skipping RLS migration $base"; continue }
    & docker cp "$($f.FullName)" ($container + ":/tmp/$base")
    & docker exec -i $container psql -U postgres -d smart_equiz_dev -f /tmp/$base
    }
}

if ($Seed) {
    Write-Host "Running local seeder"
    node scripts/run-seed.mjs --local
}

# Print counts
$C = (Invoke-Expression "docker compose $composeArgs ps -q postgres").Trim()
Write-Host "Post-seed counts:"
docker exec -i $C psql -U postgres -d smart_equiz_dev -t -A -c "SELECT count(*) FROM tournaments;"
docker exec -i $C psql -U postgres -d smart_equiz_dev -t -A -c "SELECT count(*) FROM questions;"
docker exec -i $C psql -U postgres -d smart_equiz_dev -t -A -c "SELECT count(*) FROM tournament_questions;"

Write-Host "Reset complete."
