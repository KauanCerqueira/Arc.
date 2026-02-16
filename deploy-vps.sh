#!/bin/bash

# ========================================
# Script de Deploy Automatizado - Arc VPS (Docker)
# ========================================

set -e  # Stop on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

APP_DIR="/root/arc-app"
REPO_URL="https://github.com/KauanCerqueira/Arc..git"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env"

print_step() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root (sudo)"
    exit 1
fi

# ========================================
# 1. Install Docker & Git
# ========================================
print_step "Verificando dependências..."

apt-get update

if ! command -v docker &> /dev/null; then
    print_step "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v git &> /dev/null; then
    print_step "Instalando Git..."
    apt-get install -y git
fi

# ========================================
# 2. Setup Directory and Code
# ========================================
print_step "Configurando diretório do app..."

mkdir -p $APP_DIR

# Clone or Pull
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    print_step "Atualizando código..."
    git pull
else
    print_step "Clonando repositório..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# ========================================
# 3. Configure Environment
# ========================================
print_step "Verificando configurações..."

if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production $ENV_FILE
        print_success "Arquivo .env criado a partir de .env.production"
    else
        print_error "Arquivo .env.production não encontrado! Criando .env vazio..."
        touch $ENV_FILE
    fi
    
    print_step "IMPORTANTE: Verifique o arquivo .env"
    echo "Pressione ENTER para continuar ou CTRL+C para editar..."
    read
fi

# Validate critical variables
if grep -q "POSTGRES_PASSWORD=" $ENV_FILE && [ -z "$(grep "POSTGRES_PASSWORD=" $ENV_FILE | cut -d= -f2)" ]; then
    print_error "A variável POSTGRES_PASSWORD está vazia no arquivo .env!"
    exit 1
fi


# ========================================
# 4. Deploy with Docker Compose
# ========================================
print_step "Iniciando containers..."

docker compose --env-file $ENV_FILE -f $COMPOSE_FILE down --remove-orphans || true
docker compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d --build

# ========================================
# 5. Final Check
# ========================================
print_step "Verificando status..."

sleep 10
docker compose --env-file $ENV_FILE -f $COMPOSE_FILE ps

print_success "Deploy concluído! Acesse:"
echo "Backend: api.vps7442.panel.icontainer.net"
echo "Frontend: app.vps7442.panel.icontainer.net"
