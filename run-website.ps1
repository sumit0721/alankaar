# PowerShell script to run both frontend and backend
Write-Host "Starting ALANKAAR Cosmetic Brand Website..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# Start backend in background
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "d:\antigravity project\backend"
    npm run dev
}

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in background
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "d:\antigravity project\frontend"
    npm run dev
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "Servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Yellow

# Wait for user input to stop
Read-Host "Press Enter to stop all servers"

# Stop the jobs
Write-Host "Stopping servers..." -ForegroundColor Red
Stop-Job $backendJob
Stop-Job $frontendJob
Remove-Job $backendJob
Remove-Job $frontendJob
Write-Host "All servers stopped." -ForegroundColor Red