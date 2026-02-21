# 🚀 Deploy do Backend Arc na VPS

Deploy completo do backend .NET + PostgreSQL na VPS Integrator Host usando Docker.

**Frontend:** Hospedado na Vercel (não incluído neste deployment)

---

## 📋 Pré-requisitos

### Informações da VPS
- **IP:** 209.50.228.235
- **Usuário:** root
- **Senha:** 97dGQM5RfvfS8xsJ
- **Domínio API:** api.vps7442.panel.icontainer.net
- **Recursos:** 4 vCores, 6GB RAM, 100GB SSD

### No Seu Computador
- Docker e Docker Compose instalados
- Conta no Docker Hub (para push das imagens)
- Acesso SSH à VPS
- Git configurado

---

## 📦 Fase 1: Preparação Local (Seu Computador)

### 1.1 Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.vps .env

# Editar arquivo .env
nano .env
```

**Valores obrigatórios para trocar:**

```env
# Gere senha forte
POSTGRES_PASSWORD=SuaSenhaPostgresSuperSegura123!

# Gere chave JWT (256 bits)
openssl rand -base64 32
JWT_KEY=<cole_resultado_aqui>

# Gere chave de encryption (256 bits)
openssl rand -base64 32
ENCRYPTION_MASTER_KEY=<cole_resultado_aqui>

# Após fazer deploy do frontend na Vercel
FRONTEND_URL=https://seu-projeto.vercel.app
```

### 1.2 Ajustar Docker Compose

Editar `docker-compose.vps.yml` e trocar `SEU_USUARIO_DOCKERHUB` pelo seu username real do Docker Hub:

```yaml
services:
  backend:
    image: seunome/arc-backend:latest  # <-- Trocar aqui
```

### 1.3 Build e Push da Imagem

```bash
# Navegar para pasta do backend
cd backend

# Build da imagem
docker build -t seunome/arc-backend:latest -f Dockerfile .

# Login no Docker Hub
docker login

# Push da imagem
docker push seunome/arc-backend:latest
```

Confirme que a imagem aparece em https://hub.docker.com/

---

## 🖥️ Fase 2: Configuração da VPS

### 2.1 Conectar via SSH

```bash
ssh root@209.50.228.235
# Senha: 97dGQM5RfvfS8xsJ
```

### 2.2 Instalar Dependências

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# Instalar Docker Compose V2
apt install docker-compose-plugin -y

# Verificar instalação
docker --version
docker compose version

# Instalar ferramentas
apt install git curl htop nano certbot -y
```

### 2.3 Configurar Firewall

```bash
# Permitir portas necessárias
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Ativar firewall
ufw --force enable

# Verificar status
ufw status
```

### 2.4 Criar Estrutura de Diretórios

```bash
# Diretório principal do app
mkdir -p /root/arc-app/nginx/conf.d

# Dados persistentes
mkdir -p /root/arc-data/uploads
mkdir -p /root/arc-data/backups

# Verificar
ls -la /root/arc-app/
ls -la /root/arc-data/
```

---

## 📤 Fase 3: Transfer de Arquivos

### 3.1 Transferir Arquivos de Configuração

**Do seu computador**, execute:

```bash
# Navegar para pasta do projeto
cd c:\Reps\Arc

# Transferir docker-compose
scp docker-compose.vps.yml root@209.50.228.235:/root/arc-app/docker-compose.yml

# Transferir .env
scp .env root@209.50.228.235:/root/arc-app/.env

# Transferir nginx config
scp nginx/conf.d/api-only.conf root@209.50.228.235:/root/arc-app/nginx/conf.d/default.conf

# Transferir scripts
scp scripts/backup-database.sh root@209.50.228.235:/root/arc-data/
scp scripts/renew-ssl.sh root@209.50.228.235:/root/arc-data/
scp scripts/deploy-backend.sh root@209.50.228.235:/root/arc-app/
```

### 3.2 Dar Permissões aos Scripts

**Na VPS:**

```bash
chmod +x /root/arc-data/backup-database.sh
chmod +x /root/arc-data/renew-ssl.sh
chmod +x /root/arc-app/deploy-backend.sh
```

---

## 🐳 Fase 4: Deploy dos Containers

### 4.1 Deploy Inicial (HTTP)

```bash
cd /root/arc-app

# Login no Docker Hub
docker login

# Executar deploy
./deploy-backend.sh
```

O script vai:
- ✅ Validar configurações
- ✅ Criar diretórios necessários
- ✅ Pull das imagens
- ✅ Iniciar containers
- ✅ Verificar saúde da API

### 4.2 Verificar Status

```bash
# Ver containers rodando
docker compose ps

# Ver logs do backend
docker compose logs backend

# Ver logs do postgres
docker compose logs postgres

# Testar health check
curl http://localhost:8080/health
```

**Resposta esperada:** `{"status":"Healthy"}`

---

## 🗄️ Fase 5: Configurar Database

### 5.1 Executar Migrations

```bash
cd /root/arc-app

# Executar migrations do Entity Framework
docker compose exec backend dotnet ef database update
```

**Saída esperada:** Deve aplicar todas as 33 migrations e mostrar "Done."

### 5.2 Verificar Database

```bash
# Health check do database
curl http://localhost:8080/health/ready

# Conectar ao PostgreSQL (opcional)
docker compose exec postgres psql -U arcuser -d arcdb
# Dentro do psql:
\dt  # Listar tabelas
\q   # Sair
```

---

## 🔐 Fase 6: Configurar SSL/HTTPS

### 6.1 Gerar Certificado SSL

```bash
# Parar Nginx temporariamente
cd /root/arc-app
docker compose stop nginx

# Gerar certificado com Let's Encrypt
certbot certonly --standalone \
  -d api.vps7442.panel.icontainer.net \
  --email seu-email@example.com \
  --agree-tos \
  --non-interactive

# Certificado salvo em:
# /etc/letsencrypt/live/api.vps7442.panel.icontainer.net/
```

### 6.2 Verificar Certificados

```bash
ls -la /etc/letsencrypt/live/api.vps7442.panel.icontainer.net/

# Deve mostrar:
# - fullchain.pem
# - privkey.pem
```

### 6.3 Reiniciar Nginx com SSL

```bash
# Reiniciar Nginx (vai montar os certificados via volume)
docker compose up -d nginx

# Aguardar alguns segundos
sleep 5

# Verificar logs
docker compose logs nginx
```

### 6.4 Testar HTTPS

```bash
# Testar de dentro da VPS
curl https://api.vps7442.panel.icontainer.net/health

# Testar validade SSL
openssl s_client -connect api.vps7442.panel.icontainer.net:443 -servername api.vps7442.panel.icontainer.net < /dev/null 2>/dev/null | grep "Verify return code"
```

**Resposta esperada:** `Verify return code: 0 (ok)`

### 6.5 Configurar Renovação Automática

```bash
# Editar crontab
crontab -e

# Adicionar linha (renova toda segunda-feira às 3h)
0 3 * * 1 /root/arc-data/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

---

## ✅ Fase 7: Testes Funcionais

### 7.1 Testar API Externamente

**Do seu computador:**

```bash
# Health check
curl https://api.vps7442.panel.icontainer.net/health

# Ready check (database)
curl https://api.vps7442.panel.icontainer.net/health/ready

# Swagger (se habilitado em produção)
# https://api.vps7442.panel.icontainer.net/swagger
```

### 7.2 Testar Registro e Login

```bash
# Registrar usuário
curl -X POST https://api.vps7442.panel.icontainer.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "SenhaForte123!",
    "name": "Usuario Teste"
  }'

# Login
curl -X POST https://api.vps7442.panel.icontainer.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "SenhaForte123!"
  }'
```

Deve retornar um JWT token.

### 7.3 Testar Upload de Arquivo

Use Postman ou similar para testar endpoint de upload com arquivo real.

### 7.4 Testar Persistência

```bash
# Reiniciar backend
cd /root/arc-app
docker compose restart backend

# Fazer login novamente - deve funcionar
# Arquivos em /root/arc-data/uploads devem persistir
```

---

## 🔄 Fase 8: Backup Automático

### 8.1 Configurar Backup Diário

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 2h da manhã)
0 2 * * * /root/arc-data/backup-database.sh >> /var/log/arc-backup.log 2>&1
```

### 8.2 Testar Backup Manual

```bash
/root/arc-data/backup-database.sh

# Verificar backups criados
ls -lh /root/arc-data/backups/
```

### 8.3 Restaurar Backup (se necessário)

```bash
# Listar backups disponíveis
ls -lh /root/arc-data/backups/

# Restaurar um backup específico
cd /root/arc-app
gunzip -c /root/arc-data/backups/arcdb_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U arcuser -d arcdb
```

---

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver status
docker compose ps

# Ver logs (tempo real)
docker compose logs -f backend

# Reiniciar backend
docker compose restart backend

# Parar tudo
docker compose down

# Iniciar tudo
docker compose up -d

# Remover tudo (incluindo volumes - CUIDADO!)
docker compose down -v
```

### Monitoramento

```bash
# Uso de recursos dos containers
docker stats

# Espaço em disco
df -h
du -sh /root/arc-data/*

# Espaço usado pelo Docker
docker system df

# Limpar imagens não usadas
docker system prune -a
```

### Acesso ao Backend

```bash
# Entrar no container do backend
docker compose exec backend bash

# Dentro do container:
cd /app
ls -la
dotnet --version
exit
```

### Acesso ao PostgreSQL

```bash
# Entrar no PostgreSQL
docker compose exec postgres psql -U arcuser -d arcdb

# Comandos úteis:
\dt          # Listar tabelas
\d Users     # Descrever tabela Users
SELECT COUNT(*) FROM "Users";  # Contar usuários
\q           # Sair
```

### Logs

```bash
# Logs de todos os containers
docker compose logs

# Logs de um container específico
docker compose logs backend
docker compose logs postgres
docker compose logs nginx

# Últimas 50 linhas
docker compose logs --tail=50 backend

# Tempo real
docker compose logs -f backend
```

---

## 🔄 Atualizações e Redeploy

### Quando Fizer Mudanças no Código

**No seu computador:**

```bash
# 1. Build nova imagem
cd backend
docker build -t seunome/arc-backend:latest -f Dockerfile .

# 2. Push para Docker Hub
docker push seunome/arc-backend:latest
```

**Na VPS:**

```bash
# 3. Pull e restart
cd /root/arc-app
docker compose pull backend
docker compose up -d backend

# 4. Verificar
docker compose logs -f backend
```

### Se Tiver Novas Migrations

```bash
cd /root/arc-app
docker compose exec backend dotnet ef database update
```

---

## 🚨 Troubleshooting

### Backend Não Inicia

```bash
# Ver logs detalhados
docker compose logs backend

# Verificar variáveis de ambiente
docker compose exec backend env | grep -E 'JWT|POSTGRES|FRONTEND'

# Verificar connection string
docker compose exec backend cat /app/appsettings.json
```

### Database Connection Failed

```bash
# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Testar conexão
docker compose exec postgres pg_isready

# Ver logs do postgres
docker compose logs postgres

# Verificar senha no .env
cat .env | grep POSTGRES_PASSWORD
```

### SSL Não Funciona

```bash
# Verificar certificados
ls -la /etc/letsencrypt/live/api.vps7442.panel.icontainer.net/

# Testar SSL
openssl s_client -connect api.vps7442.panel.icontainer.net:443

# Ver logs do Nginx
docker compose logs nginx

# Verificar configuração do Nginx
docker compose exec nginx cat /etc/nginx/conf.d/default.conf
```

### Uploads Não Persistem

```bash
# Verificar volume mount
docker compose exec backend ls -la /app/wwwroot/uploads

# Verificar na VPS
ls -la /root/arc-data/uploads

# Verificar configuração no docker-compose
cat docker-compose.yml | grep -A 2 "volumes:"
```

### Falta de Espaço em Disco

```bash
# Ver espaço total
df -h

# Ver espaço usado por Docker
docker system df

# Limpar containers parados
docker container prune

# Limpar imagens não usadas
docker image prune -a

# Limpar volumes não usados (CUIDADO!)
docker volume prune
```

---

## 📊 Monitoramento Contínuo

### Configurar Alertas de Disco

```bash
# Criar script de alerta
nano /root/arc-data/check-disk.sh
```

```bash
#!/bin/bash
USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $USAGE -gt 80 ]; then
    echo "ALERTA: Disco em $USAGE%"
    # Aqui você pode adicionar comando para enviar email/notificação
fi
```

```bash
chmod +x /root/arc-data/check-disk.sh

# Adicionar ao cron (checar a cada hora)
crontab -e
0 * * * * /root/arc-data/check-disk.sh
```

### Instalar ctop (Monitoring de Containers)

```bash
# Instalar ctop
wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop
chmod +x /usr/local/bin/ctop

# Executar
ctop
```

---

## 🌐 Integração com Frontend na Vercel

### 1. Deploy do Frontend na Vercel

```bash
# No Vercel Dashboard:
1. Import repository: github.com/KauanCerqueira/Arc.
2. Root Directory: frontend
3. Environment Variables:
   NEXT_PUBLIC_API_URL=https://api.vps7442.panel.icontainer.net
4. Deploy
```

### 2. Atualizar FRONTEND_URL no Backend

**Na VPS:**

```bash
# Editar .env
nano /root/arc-app/.env

# Alterar:
FRONTEND_URL=https://seu-projeto.vercel.app

# Reiniciar backend
cd /root/arc-app
docker compose restart backend
```

### 3. Testar CORS

No browser, abrir o frontend na Vercel e fazer login. Não deve ter erros de CORS no console.

---

## 📝 Checklist Completo

### ✅ Pré-Deploy
- [ ] Docker Hub: imagem do backend enviada
- [ ] .env: todas variáveis configuradas
- [ ] docker-compose.vps.yml: username Docker Hub ajustado

### ✅ VPS Setup
- [ ] SSH funcionando
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Firewall configurado (portas 22, 80, 443)
- [ ] Diretórios criados (/root/arc-app, /root/arc-data)

### ✅ Deploy
- [ ] Arquivos transferidos via SCP
- [ ] Scripts com permissões corretas
- [ ] Containers iniciados
- [ ] Migrations executadas
- [ ] Health check OK

### ✅ SSL
- [ ] Certificado Let's Encrypt gerado
- [ ] HTTPS funcionando
- [ ] Renovação automática configurada (cron)

### ✅ Backup
- [ ] Script de backup testado
- [ ] Cron job de backup configurado
- [ ] Primeiro backup criado

### ✅ Testes
- [ ] API respondendo via HTTPS
- [ ] Registro de usuário funciona
- [ ] Login retorna JWT
- [ ] Upload persiste após restart
- [ ] Frontend conecta à API sem erros CORS

### ✅ Monitoramento
- [ ] Logs configurados
- [ ] Disk space monitoring
- [ ] Containers com restart: always

---

## 🎯 Próximos Passos Opcionais

### 1. Custom Domain
- Registrar domínio próprio
- Configurar DNS apontando para 209.50.228.235
- Atualizar nginx e gerar novo certificado SSL

### 2. CI/CD Automático
- GitHub Actions para build automático
- Deploy automático ao push na branch main

### 3. Monitoring Avançado
- Instalar Grafana + Prometheus
- Alertas via email/Telegram

### 4. Cloud Storage
- Migrar uploads para S3/Azure Blob
- Remover dependência de storage local

---

## 📞 Suporte

**Logs importantes:**
- Backend: `docker compose logs backend`
- PostgreSQL: `docker compose logs postgres`
- Nginx: `docker compose logs nginx`
- SSL Renewal: `/var/log/ssl-renewal.log`
- Backups: `/var/log/arc-backup.log`

**Arquivos de configuração:**
- Docker Compose: `/root/arc-app/docker-compose.yml`
- Environment: `/root/arc-app/.env`
- Nginx: `/root/arc-app/nginx/conf.d/default.conf`

---

**Deploy realizado com sucesso! 🎉**

Backend API: https://api.vps7442.panel.icontainer.net
