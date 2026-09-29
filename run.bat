@echo off
title HostelHub - Run

echo ============================================
echo   HostelHub - Starting Application
echo ============================================
echo.

if not exist "backend\node_modules" (
    echo [ERROR] Backend dependencies not found. Please run setup.bat first.
    pause
    exit /b 1
)
if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM --- Make sure the SQL database exists ---
if not exist "backend\database\hostelhub.sqlite" (
    echo Database not found - creating it with sample data...
    pushd backend
    call npm run seed
    popd
)

echo Starting backend server on http://localhost:5000 ...
start "HostelHub Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting frontend server on http://localhost:5173 ...
start "HostelHub Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Opening HostelHub in your browser...
start http://localhost:5173

echo.
echo ============================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo   Close the two opened terminal windows to stop the servers.
echo ============================================
