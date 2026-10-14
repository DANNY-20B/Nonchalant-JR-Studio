@echo off
title NONCHALANT JR STUDIO Launcher

cd /d "%~dp0"
set "STUDIO_DIR=%~dp0"

echo ==========================================================
echo  NONCHALANT JR STUDIO - Localhost Launcher
echo ==========================================================

:: Check if server is already actively listening on port 5500
netstat -ano | findstr /R /C:":5500 .*LISTENING" >nul
if %errorlevel% neq 0 (
    echo Starting studio local server on http://localhost:5500 ...
    start /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%STUDIO_DIR%server.ps1" -Port 5500
    ping -n 3 127.0.0.1 >nul
) else (
    echo Studio server is already running on port 5500.
)

:: Open the studio in default browser
echo Opening studio in browser...
start "" "http://localhost:5500/index.html"
exit

