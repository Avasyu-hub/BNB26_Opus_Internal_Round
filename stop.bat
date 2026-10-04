@echo off
setlocal enabledelayedexpansion
title Re:Learn Stopper

echo ===================================================
echo               Re:Learn System Stopper
echo ===================================================
echo.
echo Stopping services on ports 8000 and 5173...

for %%P in (8000 5173) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P" ^| findstr "LISTENING"') do (
        echo Killing process on port %%P (PID %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo All Re:Learn servers have been stopped.
echo ===================================================
timeout /t 2 /nobreak >nul
