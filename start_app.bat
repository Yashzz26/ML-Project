@echo off
title Customer Segmentation Web App Launcher
echo ========================================================
echo   Launching Customer Segmentation ML Web Application
echo ========================================================
echo.

echo [1/3] Starting Flask Backend Server (Port 5000)...
start "Flask Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && python app.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Vite Frontend Server (Port 5173)...
start "Vite Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Opening application in browser...
start http://localhost:5173

echo.
echo ========================================================
echo   App is running!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://127.0.0.1:5000
echo.
echo   Keep the two opened command windows running while
echo   using the application. Close them when you are done.
echo ========================================================
pause
