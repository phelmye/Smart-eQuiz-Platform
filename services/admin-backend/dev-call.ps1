param(
  [string]$action = 'health',
  [string]$token = $env:ADMIN_TOKEN
)

if (-not $token) {
  Write-Error "ADMIN_TOKEN not set. Either set environment variable ADMIN_TOKEN or pass -token '<value>'"
  exit 2
}

$base = "http://localhost:4000"
switch ($action.ToLower()) {
  'health' {
    Invoke-RestMethod -Uri "$base/health" -Method Get | ConvertTo-Json -Depth 3
  }
  'seed' {
    Invoke-RestMethod -Uri "$base/admin/seed" -Method Post -Headers @{ 'x-admin-token' = $token } | ConvertTo-Json -Depth 3
  }
  'migrate' {
    Invoke-RestMethod -Uri "$base/admin/migrate" -Method Post -Headers @{ 'x-admin-token' = $token } | ConvertTo-Json -Depth 3
  }
  Default {
    Write-Error "Unknown action: $action. Use health|seed|migrate"
  }
}
