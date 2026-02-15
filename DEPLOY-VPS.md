# 🚀 Deploy no VPS Integrator Host - Guia Rápido

Este documento contém o guia rápido para fazer o deploy do Arc no VPS Integrator Host.

## 📋 Pré-requisitos

- VPS configurado e acessível via SSH
- Docker e Docker Compose instalados
- Domínio configurado (ex: `api.vps7442.panel.icontainer.net`)

## 🎯 Opção 1: Deploy Automático (Recomendado)

### 1. Conectar ao VPS via SSH

```bash
ssh root@209.50.228.235
# Senha: 97dGQM5RfvfS8xsJ
```

### 2. Executar script de deploy

```bash
# Baixar o script
curl -fsSL https://raw.githubusercontent.com/KauanCerqueira/Arc./main/deploy-vps.sh -o deploy-vps.sh

# Dar permissão de execução
chmod +x deploy-vps.sh

# Executar
./deploy-vps.sh
```

### 3. Configurar variáveis de ambiente

O script irá pausar para você editar o arquivo `.env`. Configure:

```bash
nano /root/arc-app/.env
```

**Valores obrigatórios para alterar:**
- `POSTGRES_PASSWORD`: Senha do banco de dados
- `JWT_KEY`: Chave secreta JWT (32+ caracteres)
- `FRONTEND_URL`: URL do seu frontend no Vercel

Salve (Ctrl+O) e saia (Ctrl+X)

### 4. Continuar o deploy

Pressione ENTER para continuar o script.

---

## 🎯 Opção 2: Deploy Manual

### 1. Conectar ao VPS

```bash
ssh root@209.50.228.235
```

### 2. Criar estrutura de diretórios

```bash
mkdir -p /root/arc-app
cd /root/arc-app
```

### 3. Baixar arquivos de configuração

```bash
# Docker Compose
curl -fsSL https://raw.githubusercontent.com/KauanCerqueira/Arc./main/docker-compose.production.yml -o docker-compose.yml

# Variáveis de ambiente
curl -fsSL https://raw.githubusercontent.com/KauanCerqueira/Arc./main/.env.production -o .env
```

### 4. Configurar variáveis de ambiente

```bash
nano .env
```

Edite os seguintes valores:

```env
POSTGRES_PASSWORD=SuaSenhaSegura123!
JWT_KEY=SuaChaveJWTSuperSecreta256Bits!!
FRONTEND_URL=https://seu-app.vercel.app
```

### 5. Iniciar os containers

```bash
# Pull das imagens
docker-compose pull

# Iniciar
docker-compose up -d

# Verificar
docker-compose ps
docker-compose logs -f backend
```

### 6. Testar

```bash
curl http://localhost:8080/health
```

---

## 🌐 Configurar Nginx e SSL

### Usando o Painel ICP (Mais Fácil)

1. Acesse: https://vps7442.panel.icontainer.net:2090/admin
2. Vá em **IC Web** → **Criar Domínio**
3. Configure:
   - Domínio: `api.vps7442.panel.icontainer.net`
   - Tipo: **Proxy Reverso**
   - Backend: `http://localhost:8080`
   - SSL: **Habilitar**

### Manual (Nginx + Certbot)

```bash
# Instalar Nginx
apt install -y nginx

# Criar configuração
nano /etc/nginx/sites-available/arc-api
```

Cole:

```nginx
server {
    listen 80;
    server_name api.vps7442.panel.icontainer.net;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar
ln -s /etc/nginx/sites-available/arc-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL com Certbot
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.vps7442.panel.icontainer.net
```

---

## 🎨 Configurar Frontend no Vercel

1. Acesse o **Vercel Dashboard**
2. Selecione seu projeto Arc
3. **Settings** → **Environment Variables**
4. Edite `NEXT_PUBLIC_API_URL`:
   ```
   https://api.vps7442.panel.icontainer.net/api
   ```
5. **Save** e faça **Redeploy**

---

## ✅ Verificação

### Backend (VPS)

```bash
# Health check local
curl http://localhost:8080/health

# Health check público
curl https://api.vps7442.panel.icontainer.net/health
```

### Frontend (Vercel)

1. Acesse seu app no Vercel
2. Tente fazer login
3. Verifique se não há erros de CORS no console

---

## 🔄 Atualização

### Atualizar para nova versão

```bash
cd /root/arc-app

# Pull da nova imagem
docker-compose pull backend

# Reiniciar
docker-compose up -d backend

# Verificar
docker-compose logs -f backend
```

---

## 🛠️ Comandos Úteis

```bash
# Ver logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Status
docker-compose ps

# Reiniciar tudo
docker-compose restart

# Parar tudo
docker-compose down

# Iniciar tudo
docker-compose up -d

# Backup do banco
docker exec arc-postgres pg_dump -U arcuser arcdb > backup_$(date +%Y%m%d).sql
```

---

## 🐛 Problemas Comuns

### Backend não inicia

```bash
# Ver logs completos
docker-compose logs backend

# Verificar variáveis
docker exec arc-backend env | grep -E "ConnectionStrings|JWT|CORS"
```

### Erro de CORS

```bash
# Verificar CORS configurado
docker exec arc-backend env | grep CORS

# Atualizar .env
nano .env
# Adicione: FRONTEND_URL=https://seu-app-correto.vercel.app

# Reiniciar
docker-compose restart backend
```

### PostgreSQL não conecta

```bash
# Testar conexão
docker exec -it arc-postgres psql -U arcuser -d arcdb

# Ver logs
docker-compose logs postgres
```

---

## 📞 Suporte

**VPS Integrator Host:**
- WhatsApp: (11) 94589.5095
- Portal: https://painel.integrator.host

**Documentação completa:**
- Ver: `vps_deployment_guide.md`

---

**🚀 Pronto para produção!**
