<#
Monitor CI workflow runs using gh CLI. Prints last N runs for specified workflows.
Usage: pwsh .\dev\monitor-ci.ps1 [-Limit 5]
#>

param(
  [int]$Limit = 5
)

$workflows = @('infra-smoke-test.yml','infra-nightly.yml','seed-and-verify-manual.yml')

foreach ($w in $workflows) {
  Write-Host "\nWorkflow: $w"
  $out = gh run list --workflow="$w" --limit $Limit 2>&1
  if ($LASTEXITCODE -ne 0) { Write-Host "gh CLI error listing runs for $($w):"; Write-Host $out; continue }
  Write-Host $out
}

Write-Host "\nTo stream a run: gh run watch <run-id>"
