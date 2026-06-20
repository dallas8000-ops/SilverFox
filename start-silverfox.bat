@echo off
REM SilverFox E-Commerce Platform - Startup Script
cd /d "%~dp0"

echo.
echo ========================================
echo   SilverFox E-Commerce Platform
echo   Premium Style for Gentlemen
echo ========================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js: 
node --version
echo.
echo Starting SilverFox (backend + React frontend)...
echo.

start "SilverFox Backend" cmd /k "cd /d "%~dp0silverfox-ecommerce\backend" && npm start"
timeout /t 3 /nobreak >nul

start "SilverFox Frontend" cmd /k "cd /d "%~dp0silverfox-ecommerce\React" && npm run dev"
timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo   SilverFox is starting
echo ========================================
echo.
echo   OPEN THIS URL:  http://localhost:5173
echo   API backend:    http://localhost:3001/api
echo.
echo   Do NOT use catalog-pro.html or port 5500 — that is the old site.
echo.

start http://localhost:5173/shop

pause
