@echo off
setlocal enabledelayedexpansion
title HostelHub - Setup

echo ============================================
echo   HostelHub - First Time Setup (SQL / SQLite)
echo ============================================
echo.

REM --- Check Node.js is installed (no Python / virtual env needed) ---
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js was not found on your system.
    echo Please install Node.js 18+ from https://nodejs.org and run this script again.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Found Node.js %NODE_VERSION%
echo.

REM --- Backend setup ---
echo [1/4] Installing backend dependencies...
cd backend
if not exist ".env" (
    echo Creating backend\.env from .env.example ...
    copy /Y ".env.example" ".env" >nul
)
call npm install
if errorlevel 1 (
    echo [ERROR] Backend npm install failed.
    pause
    exit /b 1
)

REM --- Create SQL database + sample data (only if it does not exist yet) ---
echo.
echo [2/4] Setting up the SQL database...
if not exist "database\hostelhub.sqlite" (
    call npm run seed
    if errorlevel 1 (
        echo [ERROR] Database seeding failed.
        pause
        exit /b 1
    )
) else (
    echo Database already exists - skipping seed. Run "npm run seed" in backend to reset it.
)
cd ..
echo.

REM --- Frontend setup ---
echo [3/4] Installing frontend dependencies...
cd frontend
if not exist ".env" (
    echo Creating frontend\.env from .env.example ...
    copy /Y ".env.example" ".env" >nul
)
call npm install
if errorlevel 1 (
    echo [ERROR] Frontend npm install failed.
    pause
    exit /b 1
)
cd ..
echo.

echo [4/4] Setup complete!
echo.
echo Database: SQLite file at backend\database\hostelhub.sqlite (no server needed)
echo Login:    admin@hostelhub.com / admin123   (student: priya@hostelhub.com / student123)
echo.
echo Now double-click run.bat to start the application.
echo ============================================
pause
