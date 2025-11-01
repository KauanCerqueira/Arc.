# Docker & Deployment Setup

Este guia explica como usar Docker e fazer deploy automático no Docker Hub e Railway.

## Sumário

- [Ambiente Local com Docker](#ambiente-local-com-docker)
- [Docker Hub - Build e Push Automático](#docker-hub---build-e-push-automático)
- [Railway - Deploy Automático](#railway---deploy-automático)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Ambiente Local com Docker

### Pré-requisitos

- Docker Desktop instalado
- Docker Compose instalado

### Como usar

1. **Copie o arquivo de variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o `.env` com suas configurações** (opcional)

3. **Inicie todos os serviços:**
   ```bash
   docker-compose up -d
   ```

4. **Verifique os logs:**
   ```bash
   # Todos os serviços
   docker-compose logs -f

   # Apenas backend
   docker-compose logs -f backend

   # Apenas frontend
   docker-compose logs -f frontend
   ```

5. **Acesse as aplicações:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Swagger: http://localhost:5001/swagger

6. **Parar os serviços:**
   ```bash
   docker-compose down
   ```

7. **Parar e remover volumes (limpar dados):**
   ```bash
   docker-compose down -v
   ```

### Build individual

Se precisar fazer build de uma imagem específica:

```bash
# Backend
docker build -t projectly-backend ./backend

# Frontend
docker build -t projectly-frontend ./frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5001
```

---

## Docker Hub - Build e Push Automático

O workflow do GitHub Actions automaticamente faz build e push das imagens Docker para o Docker Hub sempre que você fizer push para as branches `main` ou `develop`, ou criar uma tag.

### Configuração Inicial

#### 1. Criar conta no Docker Hub

Se ainda não tem, crie em: https://hub.docker.com

#### 2. Criar Access Token no Docker Hub

1. Acesse: https://hub.docker.com/settings/security
2. Clique em "New Access Token"
3. Nome: `github-actions`
4. Permissões: `Read, Write, Delete`
5. Copie o token gerado (você não poderá vê-lo novamente!)

#### 3. Configurar Secrets no GitHub

No seu repositório do GitHub:

1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `DOCKERHUB_USERNAME` | seu-username | Seu username do Docker Hub |
| `DOCKERHUB_TOKEN` | seu-token | Access token criado anteriormente |
| `NEXT_PUBLIC_API_URL` | https://sua-api.railway.app | URL da sua API em produção |

### Como funciona

O workflow é acionado automaticamente em:

- **Push para `main` ou `develop`**: Cria imagens com as tags `latest`, `main` ou `develop`
- **Push de tag (ex: `v1.0.0`)**: Cria imagens com as tags `1.0.0`, `1.0`, `latest`
- **Pull Request**: Apenas testa o build, não faz push

### Tags criadas automaticamente

```
# Para push na branch main
seu-username/projectly-backend:latest
seu-username/projectly-backend:main
seu-username/projectly-backend:main-abc1234 (SHA do commit)

# Para tag v1.2.3
seu-username/projectly-backend:latest
seu-username/projectly-backend:1.2.3
seu-username/projectly-backend:1.2
```

### Criar uma release

Para criar uma versão específica:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Isso criará automaticamente imagens com as tags `v1.0.0`, `1.0.0` e `1.0`.

### Verificar o build

1. Vá em **Actions** no seu repositório
2. Clique no workflow "Build and Push Docker Images"
3. Veja o progresso em tempo real

---

## Railway - Deploy Automático

O Railway permite deploy direto do GitHub com Dockerfile.

### Método 1: Setup via Railway Dashboard (Recomendado)

#### 1. Criar conta no Railway

Acesse: https://railway.app

#### 2. Criar projeto

1. Clique em **New Project**
2. Escolha **Deploy from GitHub repo**
3. Selecione seu repositório `Projectly`

#### 3. Configurar Banco de Dados

1. No projeto, clique em **+ New**
2. Escolha **Database** → **PostgreSQL**
3. Copie a `DATABASE_URL` gerada

#### 4. Configurar Backend

1. No projeto, clique em **+ New**
2. Escolha **GitHub Repo**
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: Detecta Dockerfile automaticamente
   - **Start Command**: Detecta automaticamente

4. Adicione as variáveis de ambiente:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:$PORT
   ConnectionStrings__DefaultConnection=<sua-database-url>
   Jwt__Key=<chave-jwt-secreta-longa>
   Jwt__Issuer=Arc.API
   Jwt__Audience=Arc.Client
   Jwt__ExpirationMinutes=43200
   ```

5. Deploy será feito automaticamente

#### 5. Configurar Frontend

1. No projeto, clique em **+ New**
2. Escolha **GitHub Repo**
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: Detecta Dockerfile automaticamente
   - **Start Command**: Detecta automaticamente

4. Adicione as variáveis de ambiente:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
   ```

5. Deploy será feito automaticamente

#### 6. Configurar Domínios (opcional)

1. Em cada serviço, clique em **Settings** → **Networking**
2. Clique em **Generate Domain**
3. Use os domínios gerados ou configure domínios personalizados

### Método 2: Deploy via GitHub Actions

Se preferir usar o workflow automático:

#### 1. Instalar Railway CLI localmente

```bash
npm install -g @railway/cli
```

#### 2. Fazer login

```bash
railway login
```

#### 3. Linkar projeto

```bash
railway link
```

#### 4. Obter token

```bash
railway whoami --token
```

#### 5. Configurar Secrets no GitHub

Adicione os seguintes secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `RAILWAY_TOKEN` | seu-token | Token do Railway CLI |
| `RAILWAY_BACKEND_SERVICE` | nome-do-servico | ID ou nome do serviço backend |
| `RAILWAY_FRONTEND_SERVICE` | nome-do-servico | ID ou nome do serviço frontend |

#### 6. Como funciona

- Push para `main` → Deploy automático no Railway
- Pode ser acionado manualmente via Actions

---

## Variáveis de Ambiente

### Backend (.NET)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `ASPNETCORE_ENVIRONMENT` | Ambiente de execução | `Production` |
| `ASPNETCORE_URLS` | URLs de escuta | `http://+:8080` |
| `ConnectionStrings__DefaultConnection` | String de conexão PostgreSQL | `Host=postgres;Port=5432;...` |
| `Jwt__Key` | Chave secreta JWT | `chave-super-segura-32-chars` |
| `Jwt__Issuer` | Emissor do token | `Arc.API` |
| `Jwt__Audience` | Audiência do token | `Arc.Client` |
| `Jwt__ExpirationMinutes` | Tempo de expiração | `43200` (30 dias) |

### Frontend (Next.js)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:5001` |

### Database (PostgreSQL)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `POSTGRES_DB` | Nome do banco | `arc` |
| `POSTGRES_USER` | Usuário | `postgres` |
| `POSTGRES_PASSWORD` | Senha | `sua-senha-forte` |

---

## Troubleshooting

### Problema: Build falha no GitHub Actions

**Solução:**
1. Verifique os logs do workflow em Actions
2. Teste o build localmente:
   ```bash
   docker build -f backend/Dockerfile backend/
   docker build -f frontend/Dockerfile frontend/
   ```

### Problema: Railway não detecta Dockerfile

**Solução:**
1. Verifique se o arquivo `railway.json` está presente
2. Confirme que o Root Directory está correto
3. Force um novo deploy:
   ```bash
   railway up --service=seu-servico
   ```

### Problema: Frontend não conecta com Backend

**Solução:**
1. Verifique se `NEXT_PUBLIC_API_URL` está configurado corretamente
2. Confirme que a URL inclui o protocolo (`https://`)
3. Verifique CORS no backend

### Problema: Banco de dados não conecta

**Solução:**
1. Confirme que a string de conexão está correta
2. No Railway, use a variável `${{Postgres.DATABASE_URL}}`
3. Verifique se o banco está rodando:
   ```bash
   docker-compose ps
   ```

---

## Scripts úteis

### Limpar tudo do Docker

```bash
# Parar todos os containers
docker stop $(docker ps -aq)

# Remover todos os containers
docker rm $(docker ps -aq)

# Remover todas as imagens
docker rmi $(docker images -q)

# Remover volumes não utilizados
docker volume prune -f

# Limpar tudo
docker system prune -a --volumes
```

### Ver logs em tempo real

```bash
# Docker Compose
docker-compose logs -f [service-name]

# Railway CLI
railway logs --service=seu-servico
```

### Executar comandos dentro do container

```bash
# Docker Compose
docker-compose exec backend bash
docker-compose exec frontend sh

# Docker direto
docker exec -it container-name bash
```

---

## Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
