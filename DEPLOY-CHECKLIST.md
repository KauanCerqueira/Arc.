# ✅ Checklist de Deploy - Backend Arc VPS

Use este arquivo para acompanhar seu progresso durante o deployment.

---

## 🎯 Pré-Deployment

### Configuração Local
- [ ] Docker e Docker Compose instalados no PC
- [ ] Conta no Docker Hub criada
- [ ] Acesso SSH à VPS testado (ssh root@209.50.228.235)
- [ ] Repositório clonado localmente

### Preparação de Arquivos
- [ ] Arquivo `.env` criado com base em `.env.vps`
- [ ] `POSTGRES_PASSWORD` definido (senha forte)
- [ ] `JWT_KEY` gerado (openssl rand -base64 32)
- [ ] `ENCRYPTION_MASTER_KEY` gerado (openssl rand -base64 32)
- [ ] `FRONTEND_URL` configurado (URL da Vercel)
- [ ] `docker-compose.vps.yml` ajustado (username Docker Hub)

---

## 🏗️ Build e Push

### Imagem Docker
- [ ] Build da imagem backend executado sem erros
  ```bash
  cd backend
  docker build -t seunome/arc-backend:latest -f Dockerfile .
  ```
- [ ] Login no Docker Hub realizado
  ```bash
  docker login
  ```
- [ ] Push da imagem para Docker Hub concluído
  ```bash
  docker push seunome/arc-backend:latest
  ```
- [ ] Imagem visível em hub.docker.com/r/seunome/arc-backend

---

## 🖥️ Configuração VPS

### Instalação de Dependências
- [ ] SSH conectado à VPS
- [ ] Sistema atualizado (apt update && apt upgrade)
- [ ] Docker instalado (curl -fsSL https://get.docker.com | sh)
- [ ] Docker Compose instalado (apt install docker-compose-plugin)
- [ ] Certbot instalado (apt install certbot)
- [ ] Ferramentas básicas instaladas (git, curl, htop, nano)

### Firewall
- [ ] Firewall UFW instalado
- [ ] Porta 22 permitida (SSH)
- [ ] Porta 80 permitida (HTTP)
- [ ] Porta 443 permitida (HTTPS)
- [ ] Firewall ativado (ufw enable)
- [ ] Status verificado (ufw status)

### Estrutura de Diretórios
- [ ] Diretório `/root/arc-app` criado
- [ ] Subdiretório `/root/arc-app/nginx/conf.d` criado
- [ ] Diretório `/root/arc-data/uploads` criado
- [ ] Diretório `/root/arc-data/backups` criado

---

## 📤 Transfer de Arquivos

### Arquivos Transferidos via SCP
- [ ] `docker-compose.vps.yml` → `/root/arc-app/docker-compose.yml`
- [ ] `.env` → `/root/arc-app/.env`
- [ ] `api-only.conf` → `/root/arc-app/nginx/conf.d/default.conf`
- [ ] `backup-database.sh` → `/root/arc-data/`
- [ ] `renew-ssl.sh` → `/root/arc-data/`
- [ ] `deploy-backend.sh` → `/root/arc-app/`

### Permissões
- [ ] `chmod +x /root/arc-data/backup-database.sh`
- [ ] `chmod +x /root/arc-data/renew-ssl.sh`
- [ ] `chmod +x /root/arc-app/deploy-backend.sh`

---

## 🐳 Deploy dos Containers

### Inicialização
- [ ] Login no Docker Hub da VPS (docker login)
- [ ] Script de deploy executado (`./deploy-backend.sh`)
- [ ] Containers iniciados com sucesso
- [ ] Status dos containers verificado (docker compose ps)
  - [ ] arc-backend: Up (healthy)
  - [ ] arc-postgres: Up (healthy)
  - [ ] arc-nginx: Up

### Logs
- [ ] Logs do backend verificados (sem erros críticos)
- [ ] Logs do postgres verificados (database ready)
- [ ] Logs do nginx verificados (servidor iniciado)

### Health Check HTTP
- [ ] `curl http://localhost:8080/health` retorna 200
- [ ] Resposta: `{"status":"Healthy"}`

---

## 🗄️ Database

### Migrations
- [ ] Acesso ao container backend obtido
- [ ] Comando de migration executado:
  ```bash
  docker compose exec backend dotnet ef database update
  ```
- [ ] Todas as 33 migrations aplicadas
- [ ] Nenhum erro durante migrations

### Verificação
- [ ] Health check do database: `curl http://localhost:8080/health/ready`
- [ ] Resposta indica "Healthy"
- [ ] Conexão ao PostgreSQL testada (opcional)

---

## 🔐 SSL/HTTPS

### Certificado Let's Encrypt
- [ ] Nginx parado temporariamente
- [ ] Certificado gerado com Certbot:
  ```bash
  certbot certonly --standalone -d api.vps7442.panel.icontainer.net --email SEU_EMAIL
  ```
- [ ] Certificados criados em `/etc/letsencrypt/live/api.vps7442.panel.icontainer.net/`
- [ ] `fullchain.pem` existe
- [ ] `privkey.pem` existe

### Configuração Nginx
- [ ] Nginx reiniciado com volumes SSL
- [ ] Nginx logs sem erros de SSL
- [ ] HTTPS funcionando: `curl https://api.vps7442.panel.icontainer.net/health`
- [ ] Redirecionamento HTTP→HTTPS funcionando
- [ ] Certificado SSL válido (verificado com openssl s_client)

### Renovação Automática
- [ ] Cron job de renovação SSL configurado
- [ ] Linha adicionada ao crontab: `0 3 * * 1 /root/arc-data/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1`
- [ ] Script de renovação testado manualmente

---

## ✅ Testes Funcionais

### API Externa
- [ ] Health check: `curl https://api.vps7442.panel.icontainer.net/health`
- [ ] Ready check: `curl https://api.vps7442.panel.icontainer.net/health/ready`
- [ ] Swagger acessível (se habilitado): https://api.vps7442.panel.icontainer.net/swagger

### Endpoints
- [ ] Registro de usuário funciona (POST /api/auth/register)
- [ ] Login funciona (POST /api/auth/login)
- [ ] JWT token retornado corretamente
- [ ] Endpoint autenticado funciona (GET /api/auth/me com Bearer token)

### Upload de Arquivos
- [ ] Upload de arquivo via API funciona
- [ ] Arquivo salvo em `/root/arc-data/uploads`
- [ ] Download do arquivo funciona
- [ ] Container backend reiniciado
- [ ] Arquivo ainda acessível após restart (persistência OK)

---

## 🔄 Backup

### Configuração
- [ ] Script de backup testado manualmente (`/root/arc-data/backup-database.sh`)
- [ ] Backup criado em `/root/arc-data/backups/`
- [ ] Arquivo .sql.gz criado com sucesso
- [ ] Cron job de backup configurado:
  ```bash
  0 2 * * * /root/arc-data/backup-database.sh >> /var/log/arc-backup.log 2>&1
  ```

### Verificação
- [ ] Backup existe: `ls -lh /root/arc-data/backups/`
- [ ] Tamanho do backup razoável (>100KB)
- [ ] Restauração testada (opcional mas recomendado)

---

## 🌐 Integração Frontend

### Deploy Vercel
- [ ] Frontend deployado na Vercel
- [ ] Environment variable configurada: `NEXT_PUBLIC_API_URL=https://api.vps7442.panel.icontainer.net`
- [ ] Deploy concluído com sucesso
- [ ] URL da Vercel obtida

### Atualizar Backend
- [ ] `.env` na VPS atualizado com `FRONTEND_URL=https://seu-app.vercel.app`
- [ ] Backend reiniciado: `docker compose restart backend`

### Teste CORS
- [ ] Frontend na Vercel acessa API sem erros
- [ ] Sem erros de CORS no console do browser
- [ ] Login via frontend funciona
- [ ] Operações CRUD funcionam

---

## 📊 Monitoramento

### Containers
- [ ] `restart: always` configurado para todos os containers
- [ ] Teste de reboot realizado (opcional)
- [ ] Containers sobem automaticamente após reboot

### Logs
- [ ] Logs centralizados acessíveis
- [ ] Log de backup: `/var/log/arc-backup.log`
- [ ] Log de SSL: `/var/log/ssl-renewal.log`
- [ ] Sem erros críticos nos logs

### Recursos
- [ ] `docker stats` mostra uso razoável de CPU/RAM
- [ ] `df -h` mostra espaço em disco suficiente (>20GB livres)
- [ ] `docker system df` mostra armazenamento Docker OK

---

## 🎉 Finalização

### Documentação
- [ ] Credenciais salvas em local seguro (não no Git!)
- [ ] Comandos úteis documentados para a equipe
- [ ] Procedimentos de backup/restore documentados

### Comunicação
- [ ] Equipe informada sobre nova URL da API
- [ ] Frontend atualizado com nova API URL
- [ ] Testes end-to-end realizados

### Cleanup
- [ ] Imagens Docker antigas removidas (docker system prune)
- [ ] Arquivos temporários removidos
- [ ] Ambiente de desenvolvimento atualizado

---

## 🎯 Deployment Completo! 🚀

**URLs:**
- API: https://api.vps7442.panel.icontainer.net
- Frontend: https://seu-app.vercel.app
- Health: https://api.vps7442.panel.icontainer.net/health

**Próximos Passos:**
- [ ] Monitorar logs nas primeiras 24h
- [ ] Configurar alertas de disco/recursos
- [ ] Planejar domínio customizado (opcional)
- [ ] Documentar processo de CI/CD (opcional)

---

**Data do Deploy:** _______________  
**Deployed por:** _______________  
**Versão:** _______________

---

📚 **Documentação Completa:** [VPS-DEPLOY.md](../VPS-DEPLOY.md)  
⚡ **Comandos Rápidos:** [QUICK-DEPLOY.md](../QUICK-DEPLOY.md)
