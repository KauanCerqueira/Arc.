# 🛠️ Comandos Úteis - Manutenção VPS

Referência rápida de comandos para manutenção do backend Arc na VPS.

---

## 🐳 Docker & Containers

### Status e Logs
```bash
# Ver status de todos os containers
docker compose ps

# Ver todos os containers (incluindo parados)
docker ps -a

# Logs em tempo real do backend
docker compose logs -f backend

# Últimas 50 linhas de log
docker compose logs --tail=50 backend

# Logs de todos os serviços
docker compose logs

# Logs do PostgreSQL
docker compose logs postgres

# Logs do Nginx
docker compose logs nginx
```

### Controle de Containers
```bash
# Iniciar todos os containers
docker compose up -d

# Parar todos os containers
docker compose down

# Reiniciar um container específico
docker compose restart backend
docker compose restart postgres
docker compose restart nginx

# Reiniciar todos
docker compose restart

# Parar um container específico
docker compose stop backend

# Iniciar um container parado
docker compose start backend
```

### Rebuild e Update
```bash
# Pull da imagem mais recente
docker compose pull backend

# Atualizar apenas o backend
docker compose up -d backend

# Rebuild completo (se alterar docker-compose.yml)
docker compose up -d --force-recreate
```

### Acesso aos Containers
```bash
# Entrar no container do backend (bash)
docker compose exec backend bash

# Executar comando no backend sem entrar
docker compose exec backend dotnet --version

# Entrar no PostgreSQL
docker compose exec postgres psql -U arcuser -d arcdb

# Ver arquivos do backend
docker compose exec backend ls -la /app

# Ver uploads
docker compose exec backend ls -la /app/wwwroot/uploads
```

---

## 🗄️ Database (PostgreSQL)

### Acesso Direto
```bash
# Conectar ao PostgreSQL
docker compose exec postgres psql -U arcuser -d arcdb

# Comandos dentro do psql:
\l              # Listar databases
\dt             # Listar tabelas
\d Users        # Descrever estrutura da tabela Users
\du             # Listar usuários
SELECT COUNT(*) FROM "Users";  # Contar registros
\q              # Sair
```

### Migrations
```bash
# Executar migrations
docker compose exec backend dotnet ef database update

# Ver status das migrations
docker compose exec backend dotnet ef migrations list

# Rollback para migration específica
docker compose exec backend dotnet ef database update MigrationName

# Gerar script SQL das migrations
docker compose exec backend dotnet ef migrations script
```

### Backup e Restore
```bash
# Backup manual
/root/arc-data/backup-database.sh

# Listar backups
ls -lh /root/arc-data/backups/

# Restaurar backup específico
gunzip -c /root/arc-data/backups/arcdb_backup_20260221_020000.sql.gz | \
  docker compose exec -T postgres psql -U arcuser -d arcdb

# Backup manual customizado (sem script)
docker compose exec postgres pg_dump -U arcuser -d arcdb > backup_manual.sql

# Backup com compressão
docker compose exec postgres pg_dump -U arcuser -d arcdb | gzip > backup_manual.sql.gz
```

### Queries Úteis
```bash
# Conectar ao psql
docker compose exec postgres psql -U arcuser -d arcdb

# Ver total de usuários
SELECT COUNT(*) FROM "Users";

# Ver usuários recentes
SELECT "Id", "Email", "Name", "CreatedAt" FROM "Users" ORDER BY "CreatedAt" DESC LIMIT 10;

# Ver workspaces
SELECT "Id", "Name", "Type", "CreatedAt" FROM "Workspaces";

# Ver tamanho do database
SELECT pg_size_pretty(pg_database_size('arcdb'));

# Ver tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔐 SSL/HTTPS

### Certificados
```bash
# Listar certificados
certbot certificates

# Ver validade
openssl x509 -in /etc/letsencrypt/live/api.vps7442.panel.icontainer.net/fullchain.pem -noout -enddate

# Testar conexão SSL
openssl s_client -connect api.vps7442.panel.icontainer.net:443 -servername api.vps7442.panel.icontainer.net

# Verificar código de retorno SSL (0 = OK)
echo | openssl s_client -servername api.vps7442.panel.icontainer.net -connect api.vps7442.panel.icontainer.net:443 2>/dev/null | grep "Verify return code"
```

### Renovação
```bash
# Renovar manualmente (dry-run, sem fazer nada)
certbot renew --dry-run

# Renovar de verdade
certbot renew

# Forçar renovação mesmo que não tenha expirado
certbot renew --force-renewal

# Executar script de renovação
/root/arc-data/renew-ssl.sh

# Ver log de renovações
cat /var/log/ssl-renewal.log
```

---

## 📊 Monitoramento

### Recursos
```bash
# Uso de CPU/RAM dos containers em tempo real
docker stats

# Uso de CPU/RAM sem stream (snapshot)
docker stats --no-stream

# Apenas backend
docker stats arc-backend --no-stream

# Espaço em disco geral
df -h

# Espaço usado por diretórios específicos
du -sh /root/arc-data/*
du -sh /root/arc-app/*

# Espaço usado pelo Docker
docker system df

# Detalhes de volumes
docker volume ls
docker volume inspect arc_postgres-data
```

### Health Checks
```bash
# Health check básico
curl http://localhost:8080/health

# Health check do database
curl http://localhost:8080/health/ready

# Health check HTTPS externo
curl https://api.vps7442.panel.icontainer.net/health

# Com headers detalhados
curl -v https://api.vps7442.panel.icontainer.net/health

# Testar tempo de resposta
time curl https://api.vps7442.panel.icontainer.net/health
```

---

## 🧹 Limpeza e Manutenção

### Cleanup Docker
```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune

# Remover tudo não usado (CUIDADO!)
docker system prune

# Remover tudo incluindo volumes (MUITO CUIDADO!)
docker system prune -a --volumes

# Verificar espaço liberado
docker system df
```

---

## 🔄 Deployment e Updates

### Deploy Nova Versão
```bash
# No seu PC: build e push
cd backend
docker build -t seunome/arc-backend:latest -f Dockerfile .
docker push seunome/arc-backend:latest

# Na VPS: pull e redeploy
cd /root/arc-app
docker compose pull backend
docker compose up -d backend

# Verificar deployment
docker compose logs -f backend
curl https://api.vps7442.panel.icontainer.net/health
```

---

## 🚨 Comandos de Emergência

### Reiniciar Tudo
```bash
cd /root/arc-app
docker compose down
docker compose up -d
```

### Reiniciar VPS Completa
```bash
reboot
# Aguardar ~2 minutos, então:
ssh root@209.50.228.235
cd /root/arc-app
docker compose ps  # Deve subir automaticamente
```

### Backup de Emergência
```bash
# Database
docker compose exec postgres pg_dump -U arcuser -d arcdb > /root/emergency-backup-$(date +%Y%m%d-%H%M%S).sql

# Uploads
tar -czf /root/uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz /root/arc-data/uploads/

# Configurações
tar -czf /root/config-backup-$(date +%Y%m%d-%H%M%S).tar.gz /root/arc-app/
```

---

**Dica:** Adicione esses comandos aos seus aliases para facilitar:
```bash
# Adicionar ao ~/.bashrc
alias arc-logs='cd /root/arc-app && docker compose logs -f backend'
alias arc-status='cd /root/arc-app && docker compose ps'
alias arc-restart='cd /root/arc-app && docker compose restart backend'
alias arc-backup='/root/arc-data/backup-database.sh'
```

Depois: `source ~/.bashrc`
