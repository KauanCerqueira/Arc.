# Arc - Setup Script for Windows
# Este script configura automaticamente o ambiente de desenvolvimento

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Arc - Setup de Desenvolvimento" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se um comando existe
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Verificar pré-requisitos
Write-Host "🔍 Verificando pré-requisitos..." -ForegroundColor Yellow
Write-Host ""

$hasDocker = Test-Command docker
$hasDotnet = Test-Command dotnet
$hasNode = Test-Command node
$hasPostgres = Test-Command psql

Write-Host "Docker: $(if($hasDocker){'✓ Instalado'}else{'✗ Não encontrado'})" -ForegroundColor $(if($hasDocker){'Green'}else{'Red'})
Write-Host ".NET SDK: $(if($hasDotnet){'✓ Instalado'}else{'✗ Não encontrado'})" -ForegroundColor $(if($hasDotnet){'Green'}else{'Red'})
Write-Host "Node.js: $(if($hasNode){'✓ Instalado'}else{'✗ Não encontrado'})" -ForegroundColor $(if($hasNode){'Green'}else{'Red'})
Write-Host "PostgreSQL: $(if($hasPostgres){'✓ Instalado'}else{'✗ Não encontrado (opcional)'})" -ForegroundColor $(if($hasPostgres){'Green'}else{'Yellow'})
Write-Host ""

# Perguntar método de setup
Write-Host "📦 Como você quer rodar o Arc?" -ForegroundColor Cyan
Write-Host "1. Docker (Recomendado - tudo automatizado)"
Write-Host "2. Manual (Backend e Frontend separados)"
Write-Host ""
$choice = Read-Host "Digite 1 ou 2"

if ($choice -eq "1") {
    # Setup com Docker
    Write-Host ""
    Write-Host "🐳 Configurando com Docker..." -ForegroundColor Green
    
    if (-not $hasDocker) {
        Write-Host "❌ Docker não está instalado!" -ForegroundColor Red
        Write-Host "Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        exit 1
    }
    
    # Copiar .env.example para .env se não existir
    if (-not (Test-Path ".env")) {
        Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Arquivo .env criado!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE: Edite o arquivo .env antes de continuar!" -ForegroundColor Yellow
        Write-Host "   Configure pelo menos:" -ForegroundColor Yellow
        Write-Host "   - POSTGRES_PASSWORD" -ForegroundColor Yellow
        Write-Host "   - JWT_KEY" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Pressione ENTER após editar o .env (ou Ctrl+C para cancelar)"
    }
    
    Write-Host ""
    Write-Host "🚀 Iniciando containers Docker..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Arc está rodando!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Acesse:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "   Backend:  http://localhost:5001" -ForegroundColor White
        Write-Host "   Swagger:  http://localhost:5001/swagger" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
        Write-Host "   Ver logs:     docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
        Write-Host "   Parar tudo:   docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
        Write-Host "   Reiniciar:    docker-compose -f docker-compose.dev.yml restart" -ForegroundColor White
    } else {
        Write-Host "❌ Erro ao iniciar containers!" -ForegroundColor Red
        Write-Host "Verifique os logs: docker-compose -f docker-compose.dev.yml logs" -ForegroundColor Yellow
    }
    
} elseif ($choice -eq "2") {
    # Setup Manual
    Write-Host ""
    Write-Host "🛠️  Setup Manual..." -ForegroundColor Green
    
    # Verificar .NET
    if (-not $hasDotnet) {
        Write-Host "❌ .NET SDK não está instalado!" -ForegroundColor Red
        Write-Host "Download: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
        exit 1
    }
    
    # Verificar Node
    if (-not $hasNode) {
        Write-Host "❌ Node.js não está instalado!" -ForegroundColor Red
        Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    # Configurar Frontend
    Write-Host ""
    Write-Host "📦 Configurando Frontend..." -ForegroundColor Yellow
    Set-Location frontend
    
    if (-not (Test-Path ".env.local")) {
        Copy-Item ".env.local.example" ".env.local" -ErrorAction SilentlyContinue
        Write-Host "✓ Arquivo .env.local criado!" -ForegroundColor Green
    }
    
    Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
    npm install
    
    Set-Location ..
    
    # Configurar Backend
    Write-Host ""
    Write-Host "🔧 Configurando Backend..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
    Write-Host "   1. Configure PostgreSQL (localhost:5432)" -ForegroundColor Yellow
    Write-Host "   2. Atualize backend/Arc.API/appsettings.Development.json" -ForegroundColor Yellow
    Write-Host "   3. Execute as migrations:" -ForegroundColor Yellow
    Write-Host "      cd backend/Arc.API" -ForegroundColor White
    Write-Host "      dotnet ef database update" -ForegroundColor White
    Write-Host ""
    
    Write-Host "✅ Setup manual concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Para iniciar:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Terminal 1 (Backend):" -ForegroundColor White
    Write-Host "   cd backend/Arc.API" -ForegroundColor White
    Write-Host "   dotnet watch run" -ForegroundColor White
    Write-Host ""
    Write-Host "   Terminal 2 (Frontend):" -ForegroundColor White
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "❌ Opção inválida!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📚 Mais informações: Veja DEV-SETUP.md" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
