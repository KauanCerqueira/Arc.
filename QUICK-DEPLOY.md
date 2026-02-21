# 🚀 Guia Rápido - Deploy Backend VPS

**TL;DR:** Comandos essenciais para deploy do backend Arc na VPS.

---

## 📋 Informações da VPS

```
IP: 209.50.228.235
User: root
Password: 97dGQM5RfvfS8xsJ
API: https://api.vps7442.panel.icontainer.net
```

---

## ⚡ Deploy em 10 Passos

### 1️⃣ No seu PC - Configurar .env
```bash
cp .env.vps .env
nano .env
# Trocar: POSTGRES_PASSWORD, JWT_KEY, ENCRYPTION_MASTER_KEY, FRONTEND_URL
```

### 2️⃣ No seu PC - Build e Push
```bash
cd backend
docker build -t seunome/arc-backend:latest -f Dockerfile .
docker login
docker push seunome/arc-backend:latest
```

### 3️⃣ No seu PC - Ajustar docker-compose
```bash
# Editar docker-compose.vps.yml
# Trocar: SEU_USUARIO_DOCKERHUB por seunome
```

### 4️⃣ SSH na VPS
```bash
ssh root@209.50.228.235
```

### 5️⃣ Instalar Docker
```bash
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin certbot -y
```

### 6️⃣ Criar diretórios
```bash
mkdir -p /root/arc-app/nginx/conf.d
mkdir -p /root/arc-data/{uploads,backups}
```

### 7️⃣ Do seu PC - Transferir arquivos
```bash
cd c:\Reps\Arc
scp docker-compose.vps.yml root@209.50.228.235:/root/arc-app/docker-compose.yml
scp .env root@209.50.228.235:/root/arc-app/.env
scp nginx/conf.d/api-only.conf root@209.50.228.235:/root/arc-app/nginx/conf.d/default.conf
scp scripts/*.sh root@209.50.228.235:/root/arc-data/
```

### 8️⃣ Na VPS - Deploy
```bash
cd /root/arc-app
docker login
docker compose pull
docker compose up -d
docker compose exec backend dotnet ef database update
```

### 9️⃣ Na VPS - Configurar SSL
```bash
docker compose stop nginx
certbot certonly --standalone -d api.vps7442.panel.icontainer.net --email seu@email.com --agree-tos
docker compose up -d nginx
```

### 🔟 Testar
```bash
curl https://api.vps7442.panel.icontainer.net/health
```

---

## 🔄 Comandos Mais Usados

### Ver status
```bash
cd /root/arc-app
docker compose ps
```

### Ver logs
```bash
docker compose logs -f backend
```

### Reiniciar backend
```bash
docker compose restart backend
```

### Atualizar após mudanças
```bash
# No seu PC: build e push
docker push seunome/arc-backend:latest

# Na VPS: pull e restart
docker compose pull backend
docker compose up -d backend
```

### Backup manual
```bash
/root/arc-data/backup-database.sh
```

### Ver backups
```bash
ls -lh /root/arc-data/backups/
```

---

## ⚠️ Troubleshooting Rápido

### API não responde
```bash
docker compose logs backend
docker compose restart backend
```

### Database error
```bash
docker compose logs postgres
docker compose exec backend dotnet ef database update
```

### SSL não funciona
```bash
ls /etc/letsencrypt/live/api.vps7442.panel.icontainer.net/
docker compose logs nginx
docker compose restart nginx
```

### Falta espaço
```bash
df -h
docker system prune -a
```

---

## 📁 Arquivos Importantes

| Arquivo | Localização VPS |
|---------|----------------|
| Docker Compose | `/root/arc-app/docker-compose.yml` |
| Environment | `/root/arc-app/.env` |
| Nginx Config | `/root/arc-app/nginx/conf.d/default.conf` |
| Uploads | `/root/arc-data/uploads/` |
| Backups | `/root/arc-data/backups/` |
| SSL Certs | `/etc/letsencrypt/live/api.vps7442.panel.icontainer.net/` |

---

## 🔐 Segurança

### Gerar senhas/keys seguras
```bash
# PostgreSQL password
openssl rand -base64 24

# JWT Key (256 bits)
openssl rand -base64 32

# Encryption Master Key (256 bits)
openssl rand -base64 32
```

---

## 🎯 Checklist Deploy

- [ ] .env configurado com valores reais
- [ ] Imagem no Docker Hub
- [ ] docker-compose.vps.yml ajustado (username)
- [ ] Arquivos transferidos via SCP
- [ ] Containers rodando
- [ ] Migrations executadas
- [ ] SSL configurado
- [ ] Health check OK
- [ ] Backup automático configurado

---

## 📞 URLs Importantes

- **API Health:** https://api.vps7442.panel.icontainer.net/health
- **Docker Hub:** https://hub.docker.com
- **Let's Encrypt:** https://letsencrypt.org

---

## 🆘 Comandos de Emergência

### Parar tudo
```bash
cd /root/arc-app
docker compose down
```

### Reiniciar VPS
```bash
reboot
# Aguardar ~2 minutos
ssh root@209.50.228.235
cd /root/arc-app
docker compose ps  # Deve estar tudo "Up" automaticamente
```

### Restaurar backup
```bash
cd /root/arc-app
gunzip -c /root/arc-data/backups/arcdb_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U arcuser -d arcdb
```

---

✅ **Documentação completa:** [VPS-DEPLOY.md](../VPS-DEPLOY.md)
