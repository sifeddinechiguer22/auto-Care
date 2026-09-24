@echo off
setlocal

set BASE_DIR=%~dp0
set BACKEND_DIR=%BASE_DIR%backend
set VENV_ACTIVATE=%BASE_DIR%.venv\Scripts\activate.bat

rem Start MySQL from XAMPP if available
if exist "C:\xampp\mysql_start.bat" (
    echo Starting MySQL from XAMPP...
    start "XAMPP MySQL" cmd /k "C:\xampp\mysql_start.bat"
) else (
    echo XAMPP MySQL script not found. Please start MySQL manually.
)

rem Wait a few seconds to let the database start
ping -n 8 127.0.0.1 > nul

rem Start backend
start "AutoCare Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && ""%VENV_ACTIVATE%"" && uvicorn app.main:app --host 0.0.0.0 --port 8000"

rem Start frontend
start "AutoCare Frontend" cmd /k "cd /d ""%BASE_DIR%"" && npm run dev -- --host 0.0.0.0 --port 3000"

echo AutoCare services started.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000/docs
endlocal
