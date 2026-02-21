# Deploy via Painel de Controle (ICP/iContainer)

Como você já configurou o projeto para usar Docker, é provável que o painel da sua VPS (ICP/iContainer) utilize uma interface parecida com o **Portainer** ou similar para gerenciar "Stacks" (Pilhas) ou "Apps".

Aqui está o guia geral para subir o projeto pelo painel:

## 1. Verifique se o Painel Suporta Git

Para que o Docker consiga construir (`build`) as imagens do seu Backend e Frontend, o painel precisa ter acesso ao código fonte.

**Procure por uma opção como:**
- **Stacks** > **Add Stack** > **Repository** (ou **Git**)
- **Applications** > **Create New** > **From Git**

## 2. Configuração via Repositório (Recomendado)

Se o painel tiver a opção de conectar um repositório Git:

1.  **Repository URL:** Coloque o link do seu GitHub: `https://github.com/KauanCerqueira/Arc..git`
    - Se o repositório for **Privado**, você precisará gerar um "Personal Access Token" no GitHub e usar na URL ou no campo de autenticação do painel.
2.  **Compose path / Config File:** `docker-compose.production.yml`
3.  **Environment Variables:** Adicione as variáveis do seu arquivo `.env`:
    - `POSTGRES_PASSWORD`: (sua senha)
    - `JWT_KEY`: (sua chave)
    - `FRONTEND_URL`: (ex: `https://app.vps7442.panel.icontainer.net`)
4.  **Deploy:** Clique em "Deploy the stack".

O painel irá clonar o repositório, ler o `docker-compose.production.yml`, construir as imagens e iniciar os containers.

## 3. Configuração via Upload Manual (Se não tiver Git)

Se o painel **NÃO** tiver opção de Git e pedir apenas para colar o `docker-compose.yml` (Web Editor), você terá problemas com as linhas `build: .`, pois o painel não terá os arquivos `Dockerfile` locais.

Nesse caso, você tem duas opções:

### Opção A: Usar o Terminal do Painel (Mais fácil)
Muitos painéis têm um botão **Console** ou **Terminal** que abre uma tela preta direto no navegador.
1.  Abra o Terminal.
2.  Siga exatamente os passos do guia anterior (`DEPLOY.md`):
    ```bash
    cd /root/arc-app
    git pull
    ./deploy-vps.sh
    ```

### Opção B: Construir Imagens Localmente (Avançado)
Você precisaria construir as imagens no seu computador, subir para o Docker Hub, e mudar o `docker-compose.production.yml` para usar as imagens do Docker Hub em vez de `build: .`.

**Recomendação:** Tente a opção de **Git** ou **Terminal** primeiro.
