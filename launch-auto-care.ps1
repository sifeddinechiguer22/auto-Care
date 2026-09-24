$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$venv = Join-Path $root '.venv'

Write-Host "Stopping stale AutoCare processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000,8000 -ErrorAction SilentlyContinue |
    Where-Object { $_.OwningProcess -gt 0 } |
    ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop
        } catch {
            Write-Host "Process $($_.OwningProcess) could not be stopped; continuing." -ForegroundColor DarkYellow
        }
    }

Write-Host "Checking MySQL..." -ForegroundColor Yellow
$mysqlRunning = $false
try {
    $conn = New-Object System.Data.Odbc.OdbcConnection("Driver={MySQL ODBC 8.0 ANSI Driver};Server=localhost;Port=3307;Uid=root;Pwd=")
    $conn.Open()
    $mysqlRunning = $true
    $conn.Close()
} catch {
    $mysqlRunning = $false
}

if (-not $mysqlRunning) {
    Write-Host "MySQL is not running. Trying to start XAMPP MySQL..." -ForegroundColor Yellow
    if (Test-Path 'C:\xampp\mysql_start.bat') {
        Start-Process 'cmd.exe' -ArgumentList '/c', 'C:\xampp\mysql_start.bat' -WindowStyle Normal
        Start-Sleep -Seconds 8
    } else {
        Write-Host "XAMPP MySQL launcher not found. Start MySQL manually in XAMPP and retry." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process 'cmd.exe' -ArgumentList '/c', "cd /d `"$backend`" && `"$venv\Scripts\Activate.ps1`" && uvicorn app.main:app --host 0.0.0.0 --port 8000" -WindowStyle Normal
Start-Sleep -Seconds 8

Write-Host "Checking backend health..." -ForegroundColor Yellow
$backendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $backendReady) {
    Write-Host "Backend did not become healthy in time. Please check uvicorn logs." -ForegroundColor Red
    exit 1
}

Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process 'cmd.exe' -ArgumentList '/c', "cd /d `"$root`" && npm run dev -- --host 0.0.0.0 --port 3000" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host "AutoCare launched successfully." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000/docs" -ForegroundColor Cyan
