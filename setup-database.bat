@echo off
echo ========================================
echo   Arc. - Setup do Banco de Dados
echo ========================================
echo.

cd backend\Arc.API

echo [1/2] Instalando dotnet-ef (se necessario)...
dotnet tool install --global dotnet-ef
dotnet tool update --global dotnet-ef

echo.
echo [2/2] Aplicando migrations ao banco de dados...
dotnet ef database update

echo.
echo ========================================
echo   Setup Concluido!
echo ========================================
echo.
echo O banco de dados 'arc' foi criado/atualizado.
echo Todas as tabelas foram criadas com sucesso.
echo.
echo Proximos passos:
echo 1. Execute 'start-local.bat' para iniciar o projeto
echo 2. Acesse http://localhost:3000
echo 3. Crie sua conta e comece a usar!
echo.
pause
