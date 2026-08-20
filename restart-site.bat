@echo off
setlocal EnableExtensions
title Techgrid Africa - Restart Server

rem ============================================================
rem  Force-restarts the Techgrid Africa local site.
rem  Kills whatever is listening on the port, then starts a fresh
rem  Python static server for this folder.
rem ============================================================

rem ---- Config --------------------------------------------------
set "PORT=8080"

rem Auto-detect Python launcher (python or py)
set "PY=python"
where python >nul 2>&1 || set "PY=py"

cd /d "%~dp0"

echo.
echo  [1/3] Stopping anything on port %PORT% ...
set "KILLED="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /C:":%PORT% " ^| findstr "LISTENING"') do (
  if not "%%p"=="0" (
    echo         killing PID %%p
    taskkill /F /T /PID %%p >nul 2>&1
    set "KILLED=1"
  )
)
if not defined KILLED echo         nothing was running on port %PORT%.
timeout /t 1 /nobreak >nul

echo  [2/3] Starting server ...
start "Techgrid Africa Server" %PY% -m http.server %PORT%

echo  [3/3] Done.
echo.
echo         Site :  http://localhost:%PORT%
echo         Stop :  close the "Techgrid Africa Server" window, or run this script again.
echo.
endlocal