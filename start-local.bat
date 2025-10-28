@echo off
echo ========================================
echo   Arc. - Iniciando Projeto Local
echo ========================================
echo.

REM Verificar se PostgreSQL está rodando
echo [1/3] Verificando PostgreSQL...
timeout /t 2 >nul

REM Iniciar Backend (.NET)
echo.
echo [2/3] Iniciando Backend (.NET 8)...
cd backend\Arc.API
start "Arc Backend" cmd /k "dotnet run"
timeout /t 5 >nul

REM Iniciar Frontend (Next.js)
echo.
echo [3/3] Iniciando Frontend (Next.js)...
cd ..\..\frontend
start "Arc Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Tudo iniciado!
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Swagger:  http://localhost:5001/swagger
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Abrir navegador
start http://localhost:3000

echo.
echo Para parar os servidores, feche as janelas do terminal.
pause
