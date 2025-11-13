param(
  [int]$requiredConsecutive = 3,
  [int]$interval = 300,
  [int]$maxAttempts = 24
)

$workflows = @('infra-smoke-test.yml','infra-nightly.yml','seed-and-verify-manual.yml')

for ($i=1; $i -le $maxAttempts; $i++) {
  Write-Host "Attempt $i/$maxAttempts - $(Get-Date)"
  $allOk = $true
  foreach ($w in $workflows) {
    Write-Host "Checking $w"
    $out = gh run list --workflow="$w" --limit $requiredConsecutive 2>&1
  if ($LASTEXITCODE -ne 0) { Write-Host ([string]::Format('gh CLI error for {0}:',$w)); Write-Host $out; $allOk=$false; break }
  $lines = $out -split "`n" | Where-Object { $_ -match 'completed' }
  $okCount = ($lines | Where-Object { $_ -match 'success' }).Count
  Write-Host ([string]::Format('{0}: {1} / {2} recent successes',$w,$okCount,$requiredConsecutive))
    if ($okCount -lt $requiredConsecutive) { $allOk = $false }
  }
  if ($allOk) { Write-Host "All workflows have $requiredConsecutive consecutive successful runs. Exiting."; break }
  if ($i -lt $maxAttempts) { Write-Host "Sleeping $interval seconds..."; Start-Sleep -Seconds $interval }
}

Write-Host "Monitoring finished."