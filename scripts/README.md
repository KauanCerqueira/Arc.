# Scripts de Manutenção - Arc Backend VPS

Scripts automatizados para gerenciar o backend Arc na VPS.

## 📁 Arquivos

### 1. `deploy-backend.sh`
**Descrição:** Script principal de deployment do backend.

**Uso:**
```bash
cd /root/arc-app
./deploy-backend.sh
```

**O que faz:**
- ✅ Valida configurações do .env
- ✅ Cria diretórios necessários
- ✅ Para containers antigos
- ✅ Pull das imagens atualizadas
- ✅ Inicia containers
- ✅ Verifica health check

**Localização na VPS:** `/root/arc-app/deploy-backend.sh`

---

### 2. `backup-database.sh`
**Descrição:** Backup automático do PostgreSQL com rotação de 7 dias.

**Uso Manual:**
```bash
/root/arc-data/backup-database.sh
```

**Uso Automático (Cron):**
```bash
crontab -e
# Adicionar linha:
0 2 * * * /root/arc-data/backup-database.sh >> /var/log/arc-backup.log 2>&1
```

**O que faz:**
- ✅ Faz dump completo do database
- ✅ Comprime com gzip
- ✅ Remove backups > 7 dias
- ✅ Exibe resumo dos backups

**Localização na VPS:** `/root/arc-data/backup-database.sh`  
**Backups salvos em:** `/root/arc-data/backups/`

**Restaurar backup:**
```bash
gunzip -c /root/arc-data/backups/arcdb_backup_20260221_020000.sql.gz | \
  docker compose exec -T postgres psql -U arcuser -d arcdb
```

---

### 3. `renew-ssl.sh`
**Descrição:** Renovação automática de certificados SSL Let's Encrypt.

**Uso Manual:**
```bash
/root/arc-data/renew-ssl.sh
```

**Uso Automático (Cron):**
```bash
crontab -e
# Adicionar linha:
0 3 * * 1 /root/arc-data/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

**O que faz:**
- ✅ Para Nginx temporariamente
- ✅ Tenta renovar certificado SSL
- ✅ Reinicia Nginx com novo certificado
- ✅ Verifica validade do certificado

**Localização na VPS:** `/root/arc-data/renew-ssl.sh`

**Nota:** Certificados Let's Encrypt expiram a cada 90 dias. Este script garante renovação automática.

---

## 🚀 Instalação

### 1. Transferir scripts do seu PC para VPS

```bash
# Do seu computador
cd c:\Reps\Arc

scp scripts/deploy-backend.sh root@209.50.228.235:/root/arc-app/
scp scripts/backup-database.sh root@209.50.228.235:/root/arc-data/
scp scripts/renew-ssl.sh root@209.50.228.235:/root/arc-data/
```

### 2. Dar permissões de execução

```bash
# Na VPS
chmod +x /root/arc-app/deploy-backend.sh
chmod +x /root/arc-data/backup-database.sh
chmod +x /root/arc-data/renew-ssl.sh
```

### 3. Configurar cron jobs

```bash
# Na VPS
crontab -e

# Adicionar estas linhas:
0 2 * * * /root/arc-data/backup-database.sh >> /var/log/arc-backup.log 2>&1
0 3 * * 1 /root/arc-data/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

**Explicação:**
- Backup: Diariamente às 2h da manhã
- SSL Renewal: Toda segunda-feira às 3h da manhã

---

## 📊 Monitoramento

### Ver logs de backup
```bash
tail -f /var/log/arc-backup.log
```

### Ver logs de SSL renewal
```bash
tail -f /var/log/ssl-renewal.log
```

### Listar backups existentes
```bash
ls -lh /root/arc-data/backups/
```

### Verificar validade do certificado SSL
```bash
echo | openssl s_client -servername api.vps7442.panel.icontainer.net -connect api.vps7442.panel.icontainer.net:443 2>/dev/null | openssl x509 -noout -enddate
```

---

## 🔧 Customização

### Alterar período de retenção de backups

Editar `/root/arc-data/backup-database.sh`:

```bash
# Mudar de 7 para 14 dias, por exemplo
RETENTION_DAYS=14
```

### Alterar horário dos cron jobs

```bash
crontab -e

# Backup às 3h da manhã (em vez de 2h)
0 3 * * * /root/arc-data/backup-database.sh >> /var/log/arc-backup.log 2>&1

# SSL renewal todo domingo às 4h (em vez de segunda às 3h)
0 4 * * 0 /root/arc-data/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

**Formato cron:** `minuto hora dia-do-mês mês dia-da-semana comando`

---

## ⚠️ Troubleshooting

### Backup falhou
```bash
# Ver erro específico
cat /var/log/arc-backup.log

# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Testar backup manualmente
/root/arc-data/backup-database.sh
```

### SSL renewal falhou
```bash
# Ver erro específico
cat /var/log/ssl-renewal.log

# Verificar se certificado ainda é válido
certbot certificates

# Renovar manualmente
certbot renew --force-renewal
```

### Script não executa (permissões)
```bash
# Verificar permissões
ls -la /root/arc-data/*.sh

# Dar permissão de execução
chmod +x /root/arc-data/backup-database.sh
chmod +x /root/arc-data/renew-ssl.sh
```

---

## 📝 Checklist de Manutenção

### Semanal
- [ ] Verificar se backups estão sendo criados
- [ ] Verificar espaço em disco: `df -h`
- [ ] Verificar logs de erro: `docker compose logs --tail=100`

### Mensal
- [ ] Testar restauração de um backup
- [ ] Verificar validade do certificado SSL
- [ ] Limpar imagens Docker antigas: `docker system prune -a`
- [ ] Revisar uso de recursos: `docker stats`

### Trimestral
- [ ] Atualizar imagens base (postgres, nginx): `docker compose pull`
- [ ] Revisar e arquivar backups antigos
- [ ] Atualizar sistema operacional: `apt update && apt upgrade`

---

## 📞 Suporte

**Arquivos importantes:**
- Scripts: `/root/arc-data/*.sh` e `/root/arc-app/deploy-backend.sh`
- Logs: `/var/log/arc-backup.log` e `/var/log/ssl-renewal.log`
- Backups: `/root/arc-data/backups/`
- Certificados SSL: `/etc/letsencrypt/live/api.vps7442.panel.icontainer.net/`

**Comandos úteis:**
```bash
# Ver todos os cron jobs
crontab -l

# Editar cron jobs
crontab -e

# Ver logs do sistema
journalctl -u docker -f

# Espaço em disco
du -sh /root/arc-data/*
```

---

✅ Scripts configurados e prontos para uso automático!
