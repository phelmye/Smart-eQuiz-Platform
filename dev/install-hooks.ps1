<#
Install git hooks from dev/hooks into .git/hooks. This is intended for local development only.
#>

$sourceDir = Join-Path $PSScriptRoot 'hooks'

# Determine repository root using git
$gitRoot = & git rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $gitRoot) {
    Write-Error "Cannot determine git repo root. Ensure git is installed and you're in the repo."
    exit 1
}
$targetDir = Join-Path $gitRoot '.git\hooks'

if (-not (Test-Path $targetDir)) {
    Write-Error "Cannot find .git/hooks directory at $targetDir. Are you in a git repo root?"
    exit 1
}

Get-ChildItem -Path $sourceDir -File | ForEach-Object {
    $src = $_.FullName
    $dest = Join-Path $targetDir $_.Name
    Copy-Item -Path $src -Destination $dest -Force
    Write-Host "Installed hook: $($_.Name)"
}

# Ensure hooks are executable on Unix systems (if running in WSL/git-bash)
if (Get-Command chmod -ErrorAction SilentlyContinue) {
    & chmod +x (Join-Path $targetDir '*') | Out-Null
}

Write-Host "Hooks installed. To bypass guard, set environment variable SKIP_PRE_PUSH_CHECK=1 for a single push."
