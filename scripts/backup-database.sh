#!/bin/bash
# ==========================================
# Script de Backup Automático - PostgreSQL
# ==========================================
# Este script faz backup do database PostgreSQL do Arc
# e mantém os últimos 7 dias de backups
#
# Instalação:
# 1. Copiar para /root/arc-data/backup-database.sh
# 2. Dar permissão: chmod +x /root/arc-data/backup-database.sh
# 3. Adicionar ao cron: crontab -e
#    0 2 * * * /root/arc-data/backup-database.sh >> /var/log/arc-backup.log 2>&1
# ==========================================

set -e

# Configurações
BACKUP_DIR="/root/arc-data/backups"
COMPOSE_DIR="/root/arc-app"
CONTAINER_NAME="arc-postgres"
DB_NAME="arcdb"
DB_USER="arcuser"
RETENTION_DAYS=7
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/arcdb_backup_$DATE.sql.gz"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Arc Database Backup - $(date)"
echo "=========================================="

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}[ERRO]${NC} Container $CONTAINER_NAME não está rodando!"
    exit 1
fi

echo -e "${YELLOW}[INFO]${NC} Iniciando backup do database..."

# Fazer backup (pg_dump via docker exec)
cd "$COMPOSE_DIR"
docker compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip > "$BACKUP_FILE"

# Verificar se backup foi criado com sucesso
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}[SUCESSO]${NC} Backup criado: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo -e "${RED}[ERRO]${NC} Falha ao criar backup!"
    exit 1
fi

# Remover backups antigos (mais de RETENTION_DAYS dias)
echo -e "${YELLOW}[INFO]${NC} Removendo backups com mais de $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -name "arcdb_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Listar backups existentes
echo -e "${YELLOW}[INFO]${NC} Backups disponíveis:"
ls -lh "$BACKUP_DIR"/arcdb_backup_*.sql.gz 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'

# Contar backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/arcdb_backup_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}[INFO]${NC} Total de backups: $BACKUP_COUNT"

echo "=========================================="
echo -e "${GREEN}Backup concluído com sucesso!${NC}"
echo "=========================================="

exit 0
