param(
  [Parameter(Mandatory=$true)] [string]$SupabaseUrl,
  [Parameter(Mandatory=$true)] [string]$ServiceRole
)

Write-Output "Running local seeder using provided Supabase service role (local only)"
$env:SUPABASE_URL = $SupabaseUrl
$env:SUPABASE_SERVICE_ROLE = $ServiceRole

node .\scripts\run-seed.mjs
