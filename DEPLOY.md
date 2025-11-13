# 🚀 Guia de Deploy - Projectly

Este guia explica como fazer o deploy automático do **Projectly** usando **GitHub Actions**, **Vercel** (frontend) e **Docker** (backend).

---

## 📋 Pré-requisitos

### 1. Contas Necessárias
- ✅ Conta no GitHub
- ✅ Conta no Vercel (gratuito)
- ✅ Servidor ou plataforma para hospedar Docker (AWS, DigitalOcean, etc.)

### 2. Ferramentas Locais
```bash
# Vercel CLI
npm install -g vercel

# Docker & Docker Compose
# https://docs.docker.com/get-docker/
```

---

## 🎯 Configuração do Deploy Automático

### **PASSO 1: Configurar Vercel (Frontend)**

#### 1.1. Link o Projeto ao Vercel
```bash
cd frontend
vercel link
```

Siga as instruções para conectar ao seu projeto Vercel.

#### 1.2. Obter Credenciais Vercel
```bash
# Token de acesso
# Visite: https://vercel.com/account/tokens
# Crie um novo token e copie

# Organization ID e Project ID
# Estão no arquivo .vercel/project.json após o link
cat .vercel/project.json
```

#### 1.3. Adicionar Secrets no GitHub

Vá em: **Repository → Settings → Secrets and variables → Actions**

Adicione os seguintes secrets:
- `VERCEL_TOKEN`: Token gerado no passo anterior
- `VERCEL_ORG_ID`: Organization ID do Vercel
- `VERCEL_PROJECT_ID`: Project ID do Vercel

---

### **PASSO 2: Configurar Docker Registry (Backend)**

O backend usa **GitHub Container Registry (ghcr.io)** - gratuito e automático!

#### 2.1. Habilitar GitHub Container Registry

1. Vá em: **Settings → Actions → General**
2. Em **Workflow permissions**, selecione:
   - ✅ **Read and write permissions**
3. Salve as alterações

#### 2.2. Configurar Secrets Adicionais (Opcional)

Se você usar outros registries (DockerHub, AWS ECR), adicione:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

---

### **PASSO 3: Variáveis de Ambiente**

#### 3.1. Configurar `.env` Local
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

#### 3.2. Configurar no Servidor de Produção
```bash
# No servidor onde rodará o Docker
nano .env
# Cole as variáveis de produção
```

#### 3.3. Configurar no Vercel
```bash
# Via CLI
cd frontend
vercel env add NEXT_PUBLIC_API_URL production
# Digite: https://api.your-domain.com

# Ou via Dashboard:
# Vercel Dashboard → Seu Projeto → Settings → Environment Variables
```

---

## 🔄 Como Funciona o Deploy Automático

### **Frontend (Vercel)**

Arquivo: `.github/workflows/deploy-vercel.yml`

**Triggers:**
- ✅ Push na branch `main` → Deploy para **Production**
- ✅ Push na branch `develop` → Deploy para **Preview**
- ✅ Pull Request → Deploy de **Preview** com comentário no PR

**O que acontece:**
1. Instala dependências
2. Faz build do Next.js
3. Deploy no Vercel
4. Comenta no PR com URL de preview (se aplicável)

---

### **Backend (Docker)**

Arquivo: `.github/workflows/docker-backend.yml`

**Triggers:**
- ✅ Push na branch `main` → Build e push com tag `latest`
- ✅ Push em outras branches → Build e push com tag da branch
- ✅ Pull Request → Apenas build (não faz push)

**O que acontece:**
1. Faz build da imagem Docker
2. Push para GitHub Container Registry
3. Cria múltiplas tags automáticas
4. Cache de layers para builds mais rápidos

**Tags geradas:**
- `ghcr.io/seu-usuario/projectly/backend:latest`
- `ghcr.io/seu-usuario/projectly/backend:main`
- `ghcr.io/seu-usuario/projectly/backend:sha-abc123`

---

## 🐳 Deploy Manual com Docker

### Opção 1: Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Projectly.git
cd Projectly

# Configure as variáveis
cp .env.example .env
nano .env

# Inicie os serviços
docker-compose up -d

# Verifique os logs
docker-compose logs -f backend

# Acesse
# Backend: http://localhost:5001
# Frontend: http://localhost:3000
```

### Opção 2: Docker Imagem do Registry

```bash
# Pull da imagem mais recente
docker pull ghcr.io/seu-usuario/projectly/backend:latest

# Execute o container
docker run -d \
  --name projectly-backend \
  -p 5001:8080 \
  --env-file .env \
  ghcr.io/seu-usuario/projectly/backend:latest

# Verifique
docker ps
docker logs projectly-backend
```

---

## 🌐 Deploy em Serviços de Cloud

### **AWS EC2 + ECS**

```bash
# 1. Configure AWS CLI
aws configure

# 2. Faça login no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <seu-account-id>.dkr.ecr.us-east-1.amazonaws.com

# 3. Pull e retag a imagem
docker pull ghcr.io/seu-usuario/projectly/backend:latest
docker tag ghcr.io/seu-usuario/projectly/backend:latest <seu-account-id>.dkr.ecr.us-east-1.amazonaws.com/projectly-backend:latest

# 4. Push para ECR
docker push <seu-account-id>.dkr.ecr.us-east-1.amazonaws.com/projectly-backend:latest

# 5. Atualize o serviço ECS
aws ecs update-service --cluster projectly --service backend --force-new-deployment
```

### **DigitalOcean App Platform**

```bash
# Use o Dockerfile diretamente
# No Dashboard do DigitalOcean:
# 1. Create App → From GitHub
# 2. Selecione o repositório
# 3. Configure:
#    - Dockerfile Path: backend/Dockerfile
#    - Port: 8080
# 4. Adicione variáveis de ambiente
# 5. Deploy!
```

### **Heroku**

```bash
# Login no Heroku
heroku login
heroku container:login

# Push da imagem
cd backend
heroku container:push web -a seu-app-projectly
heroku container:release web -a seu-app-projectly

# Configure variáveis
heroku config:set JWT_KEY="sua-chave" -a seu-app-projectly
```

---

## 🔍 Verificação de Deploy

### Frontend (Vercel)
```bash
curl https://seu-app.vercel.app
```

### Backend (Docker)
```bash
# Health check
curl http://localhost:5001/health

# Teste de autenticação
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 🐛 Troubleshooting

### Problema: Deploy do Vercel falha

**Solução:**
```bash
# Verifique os logs no GitHub Actions
# Ou teste localmente:
cd frontend
npm install
npm run build
```

### Problema: Imagem Docker não inicia

**Solução:**
```bash
# Verifique variáveis de ambiente
docker exec -it projectly-backend env

# Verifique logs
docker logs projectly-backend

# Acesse o container
docker exec -it projectly-backend /bin/bash
```

### Problema: Frontend não conecta ao Backend

**Solução:**
```bash
# Verifique CORS no backend
# Verifique NEXT_PUBLIC_API_URL no frontend
# Teste conexão:
curl -v http://seu-backend-url/health
```

---

## 📚 Recursos Úteis

- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [ASP.NET Core Docker](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)

---

## 🎉 Pronto!

Agora seu Projectly está configurado para **deploy automático**! 🚀

**Fluxo de trabalho:**
1. ✅ Faça commit e push para `main`
2. ✅ GitHub Actions faz build e deploy automaticamente
3. ✅ Frontend no Vercel
4. ✅ Backend no Docker Registry
5. ✅ Pull e execute no servidor de produção

**Qualquer dúvida, consulte os logs do GitHub Actions!** ✨
