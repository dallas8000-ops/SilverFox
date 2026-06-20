# SilverFox — start backend first, wait for /health/, then Vite (Kistie-style dev flow)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $Root "silverfox-ecommerce\backend"
$FrontendDir = Join-Path $Root "silverfox-ecommerce\React"
$HealthUrl = "http://127.0.0.1:3001/health"

Write-Host ""
Write-Host "========================================"
Write-Host "  SilverFox — local dev"
Write-Host "========================================"
Write-Host ""

# Start backend
Write-Host "Starting backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; npm start"

# Wait for health
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
}
if (-not $ready) {
  Write-Warning "Backend health check timed out — starting Vite anyway."
} else {
  Write-Host "Backend ready at $HealthUrl"
}

# Start Vite
Write-Host "Starting Vite frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendDir'; npm run dev"

Start-Sleep -Seconds 3
Write-Host ""
Write-Host "  Storefront: http://localhost:5173/shop"
Write-Host "  API:        http://localhost:3001/api"
Write-Host ""
Start-Process "http://localhost:5173/shop"
