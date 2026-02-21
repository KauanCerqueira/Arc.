#!/bin/bash
# ==========================================
# Script de Deploy Simplificado - VPS
# ==========================================
# Este script faz o deploy completo do backend Arc na VPS
# Uso: ./deploy-backend.sh
# ==========================================

set -e

# Configurações
COMPOSE_FILE="docker-compose.vps.yml"
ENV_FILE=".env"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo -e "${BLUE}Arc Backend - Deploy VPS${NC}"
echo "=========================================="

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERRO]${NC} Este script deve ser executado como root!"
    echo "Use: sudo ./deploy-backend.sh"
    exit 1
fi

# Verificar se arquivo .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}[ERRO]${NC} Arquivo $ENV_FILE não encontrado!"
    echo "Copie .env.vps para .env e preencha os valores:"
    echo "  cp .env.vps .env"
    echo "  nano .env"
    exit 1
fi

# Verificar variáveis críticas
echo -e "${YELLOW}[INFO]${NC} Verificando configurações..."
source "$ENV_FILE"

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "TROCAR_POR_SENHA_SEGURA_AQUI" ]; then
    echo -e "${RED}[ERRO]${NC} POSTGRES_PASSWORD não configurado em $ENV_FILE"
    exit 1
fi

if [ -z "$JWT_KEY" ] || [ "$JWT_KEY" = "TROCAR_POR_CHAVE_JWT_SEGURA_256_BITS" ]; then
    echo -e "${RED}[ERRO]${NC} JWT_KEY não configurado em $ENV_FILE"
    exit 1
fi

if [ -z "$ENCRYPTION_MASTER_KEY" ] || [ "$ENCRYPTION_MASTER_KEY" = "TROCAR_POR_CHAVE_ENCRYPTION_256_BITS" ]; then
    echo -e "${RED}[ERRO]${NC} ENCRYPTION_MASTER_KEY não configurado em $ENV_FILE"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Configurações válidas!"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} Docker não está instalado!"
    echo "Instale com: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} Docker Compose não está instalado!"
    echo "Instale com: apt install docker-compose-plugin -y"
    exit 1
fi

# Criar diretório para uploads se não existir
echo -e "${YELLOW}[INFO]${NC} Criando diretórios de dados..."
mkdir -p /root/arc-data/uploads
mkdir -p /root/arc-data/backups

# Parar containers antigos
echo -e "${YELLOW}[INFO]${NC} Parando containers antigos..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans || true

# Pull das imagens atualizadas
echo -e "${YELLOW}[INFO]${NC} Baixando imagens atualizadas..."
docker compose -f "$COMPOSE_FILE" pull

# Iniciar containers
echo -e "${YELLOW}[INFO]${NC} Iniciando containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Aguardar containers iniciarem
echo -e "${YELLOW}[INFO]${NC} Aguardando containers iniciarem..."
sleep 10

# Verificar status
echo -e "${YELLOW}[INFO]${NC} Verificando status dos containers..."
docker compose -f "$COMPOSE_FILE" ps

# Health check
echo -e "${YELLOW}[INFO]${NC} Verificando saúde da API..."
sleep 5

if curl -f http://localhost:8080/health &> /dev/null; then
    echo -e "${GREEN}[SUCESSO]${NC} API está respondendo!"
else
    echo -e "${RED}[AVISO]${NC} API não está respondendo ainda. Verifique os logs:"
    echo "  docker compose -f $COMPOSE_FILE logs backend"
fi

echo "=========================================="
echo -e "${GREEN}Deploy concluído!${NC}"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Executar migrations do database:"
echo "   docker compose -f $COMPOSE_FILE exec backend dotnet ef database update"
echo ""
echo "2. Configurar SSL com Let's Encrypt (se ainda não configurado)"
echo ""
echo "3. Verificar logs:"
echo "   docker compose -f $COMPOSE_FILE logs -f backend"
echo ""
echo "4. Acessar API:"
echo "   https://api.vps7442.panel.icontainer.net/health"
echo ""

exit 0
