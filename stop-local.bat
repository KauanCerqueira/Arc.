@echo off
echo ========================================
echo   Arc. - Parando Servidores
echo ========================================
echo.

echo Parando processo .NET (porta 5001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    taskkill /PID %%a /F 2>nul
)

echo Parando processo Node.js (porta 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F 2>nul
)

echo.
echo Todos os servidores foram parados.
pause
