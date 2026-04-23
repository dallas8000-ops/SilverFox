@echo off
REM SilverFox E-Commerce Platform - Startup Script
REM Starts both backend and frontend servers

echo.
echo ========================================
echo   SilverFox E-Commerce Platform
echo   Premium Style for Gentlemen
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version

echo.
echo Starting SilverFox servers...
echo.

REM Start backend and frontend in separate windows
start "SilverFox Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak

start "SilverFox Frontend" cmd /k "cd React && npm run dev"
timeout /t 2 /nobreak

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop
echo.
pause
