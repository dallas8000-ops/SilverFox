# SilverFox — Django first, wait for /health/ (Kistie-style)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$HealthUrl = "http://127.0.0.1:8000/health/"

Write-Host ""
Write-Host "========================================"
Write-Host "  SilverFox Django — local dev"
Write-Host "========================================"
Write-Host ""

Write-Host "Starting Django (port 8000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; python manage.py runserver"

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
}

if ($ready) {
  Write-Host "Django ready at $HealthUrl"
} else {
  Write-Warning "Health check timed out — is Python/Django installed?"
}

Write-Host ""
Write-Host "  Storefront: http://127.0.0.1:8000/shop/"
Write-Host "  Staff:      http://127.0.0.1:8000/staff/login/"
Write-Host "  Admin:      http://127.0.0.1:8000/admin/"
Write-Host ""
Start-Process "http://127.0.0.1:8000/shop/"
