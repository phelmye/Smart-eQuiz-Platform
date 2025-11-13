$uri = 'http://localhost:3000/api/auth/login'
$body = '{"email":"admin@demo.local","password":"password123"}'
$max = 30
for ($i = 0; $i -lt $max; $i++) {
  try {
    $r = Invoke-RestMethod -Method POST -Uri $uri -ContentType 'application/json' -Body $body -ErrorAction Stop
    Write-Host 'SUCCESS:'
    $r | ConvertTo-Json -Compress | Write-Host
    break
  } catch {
    Write-Host "Attempt ${i}: endpoint not ready"
    Start-Sleep -Seconds 1
  }
}
if ($i -ge $max) { Write-Host 'Timed out waiting for endpoint'; exit 2 }
