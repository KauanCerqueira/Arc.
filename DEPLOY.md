# Guia de Deploy - Arc (Docker)

Este guia descreve os passos para realizar o deploy da aplicação Arc em sua VPS (vps7442.panel.icontainer.net) utilizando **Docker**.

## Pré-requisitos

- Acesso SSH à VPS como `root` ou usuário com `sudo`.
- Git instalado (o script instalará se não estiver presente).

## Passo a Passo

1.  **Acesse sua VPS via SSH:**
    ```bash
    ssh root@vps7442.panel.icontainer.net
    ```

2.  **Clone ou Atualize o Repositório:**
    Se for a primeira vez:
    ```bash
    git clone https://github.com/KauanCerqueira/Arc..git /root/arc-app
    cd /root/arc-app
    ```
    
    Se já existir:
    ```bash
    cd /root/arc-app
    git pull
    ```

3.  **Configure o Ambiente:**
    Crie ou edite o arquivo `.env`:
    ```bash
    cp .env.production .env
    nano .env
    ```
    **Importante:** Atualize as variáveis `POSTGRES_PASSWORD`, `JWT_KEY`, e `FRONTEND_URL` com seus valores reais.

4.  **Dê permissão de execução ao script de deploy:**
    ```bash
    chmod +x deploy-vps.sh
    ```

5.  **Execute o Script de Deploy:**
    ```bash
    ./deploy-vps.sh
    ```
    
    Este script irá:
    - Instalar Docker e Docker Compose (se necessário).
    - Construir as imagens Docker para Backend e Frontend.
    - Iniciar os containers (Backend, Frontend, Postgres, Nginx).

6.  **Verifique os Containers:**
    ```bash
    docker compose -f docker-compose.production.yml ps
    ```
    Todos os serviços devem estar com status "Up".

## Configuração de DNS

Certifique-se de que os seguintes registros DNS tipo A apontam para o IP da sua VPS:
- `api.vps7442.panel.icontainer.net`
- `app.vps7442.panel.icontainer.net`

## Atualizações Futuras

Para atualizar a aplicação:
```bash
cd /root/arc-app
./deploy-vps.sh
```
Isso irá baixar o código, reconstruir as imagens e reiniciar os containers.
