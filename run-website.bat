@echo off
echo Starting ALANKAAR Cosmetic Brand Website...
echo ================================================

echo Starting Backend Server...
start "Backend" cmd /k "cd /d d:\antigravity project\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d d:\antigravity project\frontend && npm run dev"

echo.
echo ================================================
echo Servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ================================================
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Backend*" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend*" /T /F > nul 2>&1
echo All servers stopped.