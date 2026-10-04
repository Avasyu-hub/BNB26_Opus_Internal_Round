@echo off
setlocal enabledelayedexpansion
title Re:Learn Launcher

echo ===================================================
echo               Re:Learn System Launcher
echo ===================================================
echo.

:: Auto-detect location (whether placed in workspace root or relearn subfolder)
if exist "%~dp0backend" (
    set "RELEARN_DIR=%~dp0"
    set "ROOT_DIR=%~dp0..\"
) else (
    set "ROOT_DIR=%~dp0"
    set "RELEARN_DIR=%ROOT_DIR%relearn\"
)
set "FRONTEND_DIR=%RELEARN_DIR%member-2-student-experience"

:: 1. Locate Python executable in .venv or system PATH
set "PYTHON_EXE="
if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT_DIR%.venv\Scripts\python.exe"
) else if exist "%RELEARN_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%RELEARN_DIR%\.venv\Scripts\python.exe"
) else (
    where python >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_EXE=python"
    )
)

if not defined PYTHON_EXE (
    echo [ERROR] Python environment not found!
    echo Please make sure .venv exists or Python is installed in PATH.
    pause
    exit /b 1
)

:: 2. Check for Node / npm
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] 'npm' was not found in PATH!
    echo Please install Node.js to run the frontend.
    pause
    exit /b 1
)

:: 3. Start Backend server in a dedicated window
echo [1/2] Starting FastAPI backend on http://localhost:8000...
start "Re:Learn Backend (Port 8000)" cmd /k "title Re:Learn Backend (Port 8000) && cd /d "%RELEARN_DIR%" && "%PYTHON_EXE%" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

:: Give backend a second to initialize
timeout /t 2 /nobreak >nul

:: 4. Start Frontend dev server in a dedicated window
echo [2/2] Starting Vite React frontend on http://localhost:5173...
start "Re:Learn Frontend (Port 5173)" cmd /k "title Re:Learn Frontend (Port 5173) && cd /d "%FRONTEND_DIR%" && npm run dev"

:: Wait 3 seconds before opening browser
timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo   Re:Learn is up and running!
echo.
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo.
echo   Opening browser at http://localhost:5173...
echo   To stop the services, simply close the opened windows.
echo ===================================================
echo.

start http://localhost:5173

pause
