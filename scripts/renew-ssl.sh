#!/bin/bash
# ==========================================
# Script de Renovação SSL - Let's Encrypt
# ==========================================
# Este script renova certificados SSL e reinicia o Nginx
#
# Instalação:
# 1. Copiar para /root/arc-data/renew-ssl.sh
# 2. Dar permissão: chmod +x /root/arc-data/renew-ssl.sh
# 3. Adicionar ao cron: crontab -e
#    0 3 * * 1 /root/arc-data/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
# ==========================================

set -e

# Configurações
COMPOSE_DIR="/root/arc-app"
DOMAIN="api.vps7442.panel.icontainer.net"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "SSL Certificate Renewal - $(date)"
echo "=========================================="

# Verificar se Certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} Certbot não está instalado!"
    echo "Instale com: apt install certbot -y"
    exit 1
fi

# Parar Nginx temporariamente para Certbot usar porta 80
echo -e "${YELLOW}[INFO]${NC} Parando Nginx..."
cd "$COMPOSE_DIR"
docker compose stop nginx

# Aguardar Nginx parar completamente
sleep 3

# Tentar renovar certificado
echo -e "${YELLOW}[INFO]${NC} Tentando renovar certificado SSL..."
if certbot renew --standalone --non-interactive --quiet; then
    echo -e "${GREEN}[SUCESSO]${NC} Certificado renovado (ou já está válido)!"
else
    echo -e "${YELLOW}[AVISO]${NC} Não foi necessário renovar (certificado ainda válido)"
fi

# Reniciar Nginx
echo -e "${YELLOW}[INFO]${NC} Reiniciando Nginx..."
docker compose up -d nginx

# Aguardar Nginx inicializar
sleep 3

# Verificar se Nginx está rodando
if docker ps | grep -q "arc-nginx"; then
    echo -e "${GREEN}[SUCESSO]${NC} Nginx reiniciado com sucesso!"
else
    echo -e "${RED}[ERRO]${NC} Nginx não iniciou corretamente!"
    exit 1
fi

# Verificar validade do certificado
echo -e "${YELLOW}[INFO]${NC} Verificando validade do certificado..."
EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$EXPIRY_DATE" ]; then
    echo -e "${GREEN}[INFO]${NC} Certificado válido até: $EXPIRY_DATE"
else
    echo -e "${YELLOW}[AVISO]${NC} Não foi possível verificar a validade do certificado"
fi

echo "=========================================="
echo -e "${GREEN}Renovação SSL concluída!${NC}"
echo "=========================================="

exit 0
