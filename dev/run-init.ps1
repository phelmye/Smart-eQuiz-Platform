# dev/run-init.ps1
# Helper to bring up the dev stack, reset DB (migrate reset + seed), and start the API.
# Intended for local development only.

param(
  [int]$PostgresPort = 5432,
  [int]$ApiPort = 3000,
  [int]$TimeoutSeconds = 120
)

Write-Host "Starting core dev services (postgres, redis, adminer, admin-backend)..."
docker compose -f .\dev\docker-compose.yml up -d --build postgres redis adminer admin-backend | Write-Host

# Wait for Postgres TCP port
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while (-not (Test-NetConnection -ComputerName 'localhost' -Port $PostgresPort).TcpTestSucceeded) {
  if ((Get-Date) -gt $deadline) {
    Write-Error "Timeout waiting for Postgres on port $PostgresPort"
    exit 2
  }
  Write-Host "waiting for postgres..."
  Start-Sleep -Seconds 1
}
Write-Host "Postgres is ready. Running one-shot api-init (migrate reset + seed)..."

# Run the api-init one-shot which resets DB and seeds demo data
$init = docker compose -f .\dev\docker-compose.yml up --build api-init
Write-Host $init
if ($LASTEXITCODE -ne 0) {
  Write-Error "api-init failed (exit code $LASTEXITCODE)"
  docker compose -f .\dev\docker-compose.yml logs api-init --no-color | Out-String | Write-Host
  exit $LASTEXITCODE
}

Write-Host "api-init completed. Starting api service..."
docker compose -f .\dev\docker-compose.yml up -d --build api | Write-Host

# Wait for API readiness
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while (-not (Test-NetConnection -ComputerName 'localhost' -Port $ApiPort).TcpTestSucceeded) {
  if ((Get-Date) -gt $deadline) {
    Write-Error "Timeout waiting for API on port $ApiPort"
    docker compose -f .\dev\docker-compose.yml logs api --no-color | Out-String | Write-Host
    exit 3
  }
  Write-Host "waiting for api..."
  Start-Sleep -Seconds 1
}

Write-Host "API is ready at http://localhost:$ApiPort"
Write-Host "Run 'docker compose -f dev/docker-compose.yml logs -f api' to follow logs, or 'docker compose -f dev/docker-compose.yml down -v' to tear down."