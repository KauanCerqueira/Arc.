#!/bin/bash

# ========================================
# Script de Deploy Automatizado - Arc VPS
# ========================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do Arc no VPS..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========================================
# Configurações
# ========================================
APP_DIR="/root/arc-app"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env"
BACKUP_DIR="/root/backups"

# ========================================
# Funções
# ========================================

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_step() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

# ========================================
# Verificações Iniciais
# ========================================

print_step "Verificando pré-requisitos..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi

print_success "Pré-requisitos verificados"

# ========================================
# Criar diretórios
# ========================================

print_step "Criando estrutura de diretórios..."

mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR
cd $APP_DIR

print_success "Diretórios criados"

# ========================================
# Backup do banco de dados (se existir)
# ========================================

if docker ps | grep -q arc-postgres; then
    print_step "Fazendo backup do banco de dados..."
    
    BACKUP_FILE="$BACKUP_DIR/arc_backup_$(date +%Y%m%d_%H%M%S).sql"
    docker exec arc-postgres pg_dump -U arcuser arcdb > $BACKUP_FILE 2>/dev/null || print_warning "Backup falhou (normal se for primeira instalação)"
    
    if [ -f "$BACKUP_FILE" ]; then
        print_success "Backup salvo em: $BACKUP_FILE"
    fi
fi

# ========================================
# Baixar arquivos de configuração
# ========================================

print_step "Baixando arquivos de configuração do GitHub..."

# URL do repositório
REPO_URL="https://raw.githubusercontent.com/KauanCerqueira/Arc./main"

# Baixar docker-compose
curl -fsSL "$REPO_URL/docker-compose.production.yml" -o $COMPOSE_FILE || {
    print_error "Falha ao baixar docker-compose.yml"
    exit 1
}

# Baixar .env.example se .env não existir
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Arquivo .env não encontrado, baixando template..."
    curl -fsSL "$REPO_URL/.env.production" -o $ENV_FILE || {
        print_error "Falha ao baixar .env"
        exit 1
    }
    
    print_warning "IMPORTANTE: Edite o arquivo .env com suas configurações!"
    print_warning "Execute: nano $APP_DIR/.env"
    
    read -p "Pressione ENTER após configurar o .env ou CTRL+C para cancelar..."
fi

print_success "Arquivos baixados"

# ========================================
# Validar arquivo .env
# ========================================

print_step "Validando configurações..."

if ! grep -q "POSTGRES_PASSWORD=.*[^!]" $ENV_FILE || grep -q "TroquePorSenha" $ENV_FILE; then
    print_error "Configure a senha do PostgreSQL no arquivo .env!"
    exit 1
fi

if ! grep -q "JWT_KEY=.*[^!]" $ENV_FILE || grep -q "SuaChave" $ENV_FILE; then
    print_error "Configure a JWT_KEY no arquivo .env!"
    exit 1
fi

if ! grep -q "FRONTEND_URL=https://" $ENV_FILE || grep -q "seu-app.vercel" $ENV_FILE; then
    print_error "Configure o FRONTEND_URL no arquivo .env!"
    exit 1
fi

print_success "Configurações válidas"

# ========================================
# Pull das imagens Docker
# ========================================

print_step "Baixando imagens Docker..."

docker-compose -f $COMPOSE_FILE pull

print_success "Imagens baixadas"

# ========================================
# Parar containers antigos
# ========================================

if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    print_step "Parando containers antigos..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Containers parados"
fi

# ========================================
# Iniciar novos containers
# ========================================

print_step "Iniciando containers..."

docker-compose -f $COMPOSE_FILE up -d

print_success "Containers iniciados"

# ========================================
# Aguardar health checks
# ========================================

print_step "Aguardando serviços ficarem prontos..."

MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec arc-backend wget --spider --quiet http://localhost:8080/health 2>/dev/null; then
        print_success "Backend está online!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo -n "."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Backend não ficou pronto a tempo"
    print_warning "Verifique os logs: docker-compose -f $COMPOSE_FILE logs backend"
    exit 1
fi

# ========================================
# Verificar status
# ========================================

print_step "Status dos containers:"
docker-compose -f $COMPOSE_FILE ps

# ========================================
# Testes finais
# ========================================

print_step "Executando testes..."

# Teste 1: Health check do backend
if curl -f http://localhost:8080/health &>/dev/null; then
    print_success "Health check do backend: OK"
else
    print_error "Health check do backend: FALHOU"
fi

# Teste 2: PostgreSQL
if docker exec arc-postgres pg_isready -U arcuser &>/dev/null; then
    print_success "PostgreSQL: Conectado"
else
    print_error "PostgreSQL: Falha na conexão"
fi

# ========================================
# Informações finais
# ========================================

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo "=================================================="
echo ""
echo "📊 Informações do serviço:"
echo "  • Backend API: http://localhost:8080"
echo "  • Domínio público: https://api.vps7442.panel.icontainer.net"
echo "  • Health Check: http://localhost:8080/health"
echo ""
echo "📝 Comandos úteis:"
echo "  • Ver logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  • Status: docker-compose -f $COMPOSE_FILE ps"
echo "  • Reiniciar: docker-compose -f $COMPOSE_FILE restart"
echo "  • Parar: docker-compose -f $COMPOSE_FILE down"
echo ""
echo "⚙️ Próximos passos:"
echo "  1. Configure o Nginx/SSL (ver guia de deploy)"
echo "  2. Atualize o FRONTEND_URL no Vercel"
echo "  3. Teste a integração frontend-backend"
echo ""
echo "🔍 Monitoramento:"
echo "  • Logs: docker-compose -f $COMPOSE_FILE logs -f backend"
echo "  • Stats: docker stats"
echo ""

print_success "Tudo pronto! 🚀"
