#!/bin/bash

# Arc - Setup Script for Linux/Mac
# Este script configura automaticamente o ambiente de desenvolvimento

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=============================================${NC}"
echo -e "${CYAN}  Arc - Setup de Desenvolvimento${NC}"
echo -e "${CYAN}=============================================${NC}"
echo ""

# Verificar pré-requisitos
echo -e "${YELLOW}🔍 Verificando pré-requisitos...${NC}"
echo ""

command_exists() {
    command -v "$1" &> /dev/null
}

HAS_DOCKER=$(command_exists docker && echo "true" || echo "false")
HAS_DOTNET=$(command_exists dotnet && echo "true" || echo "false")
HAS_NODE=$(command_exists node && echo "true" || echo "false")
HAS_POSTGRES=$(command_exists psql && echo "true" || echo "false")

echo -e "Docker: $([ "$HAS_DOCKER" = "true" ] && echo -e "${GREEN}✓ Instalado${NC}" || echo -e "${RED}✗ Não encontrado${NC}")"
echo -e ".NET SDK: $([ "$HAS_DOTNET" = "true" ] && echo -e "${GREEN}✓ Instalado${NC}" || echo -e "${RED}✗ Não encontrado${NC}")"
echo -e "Node.js: $([ "$HAS_NODE" = "true" ] && echo -e "${GREEN}✓ Instalado${NC}" || echo -e "${RED}✗ Não encontrado${NC}")"
echo -e "PostgreSQL: $([ "$HAS_POSTGRES" = "true" ] && echo -e "${GREEN}✓ Instalado${NC}" || echo -e "${YELLOW}✗ Não encontrado (opcional)${NC}")"
echo ""

# Perguntar método de setup
echo -e "${CYAN}📦 Como você quer rodar o Arc?${NC}"
echo "1. Docker (Recomendado - tudo automatizado)"
echo "2. Manual (Backend e Frontend separados)"
echo ""
read -p "Digite 1 ou 2: " choice

if [ "$choice" = "1" ]; then
    # Setup com Docker
    echo ""
    echo -e "${GREEN}🐳 Configurando com Docker...${NC}"
    
    if [ "$HAS_DOCKER" = "false" ]; then
        echo -e "${RED}❌ Docker não está instalado!${NC}"
        echo -e "${YELLOW}Download: https://www.docker.com/products/docker-desktop/${NC}"
        exit 1
    fi
    
    # Copiar .env.example para .env se não existir
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}📝 Criando arquivo .env...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ Arquivo .env criado!${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo .env antes de continuar!${NC}"
        echo -e "${YELLOW}   Configure pelo menos:${NC}"
        echo -e "${YELLOW}   - POSTGRES_PASSWORD${NC}"
        echo -e "${YELLOW}   - JWT_KEY${NC}"
        echo ""
        read -p "Pressione ENTER após editar o .env (ou Ctrl+C para cancelar)" 
    fi
    
    echo ""
    echo -e "${GREEN}🚀 Iniciando containers Docker...${NC}"
    docker-compose -f docker-compose.dev.yml up -d
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Arc está rodando!${NC}"
        echo ""
        echo -e "${CYAN}📊 Acesse:${NC}"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:5001"
        echo "   Swagger:  http://localhost:5001/swagger"
        echo ""
        echo -e "${CYAN}📝 Comandos úteis:${NC}"
        echo "   Ver logs:     docker-compose -f docker-compose.dev.yml logs -f"
        echo "   Parar tudo:   docker-compose -f docker-compose.dev.yml down"
        echo "   Reiniciar:    docker-compose -f docker-compose.dev.yml restart"
    else
        echo -e "${RED}❌ Erro ao iniciar containers!${NC}"
        echo -e "${YELLOW}Verifique os logs: docker-compose -f docker-compose.dev.yml logs${NC}"
    fi
    
elif [ "$choice" = "2" ]; then
    # Setup Manual
    echo ""
    echo -e "${GREEN}🛠️  Setup Manual...${NC}"
    
    # Verificar .NET
    if [ "$HAS_DOTNET" = "false" ]; then
        echo -e "${RED}❌ .NET SDK não está instalado!${NC}"
        echo -e "${YELLOW}Download: https://dotnet.microsoft.com/download/dotnet/8.0${NC}"
        exit 1
    fi
    
    # Verificar Node
    if [ "$HAS_NODE" = "false" ]; then
        echo -e "${RED}❌ Node.js não está instalado!${NC}"
        echo -e "${YELLOW}Download: https://nodejs.org/${NC}"
        exit 1
    fi
    
    # Configurar Frontend
    echo ""
    echo -e "${YELLOW}📦 Configurando Frontend...${NC}"
    cd frontend
    
    if [ ! -f ".env.local" ]; then
        cp .env.local.example .env.local 2>/dev/null || true
        echo -e "${GREEN}✓ Arquivo .env.local criado!${NC}"
    fi
    
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    npm install
    
    cd ..
    
    # Configurar Backend
    echo ""
    echo -e "${YELLOW}🔧 Configurando Backend...${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo -e "${YELLOW}   1. Configure PostgreSQL (localhost:5432)${NC}"
    echo -e "${YELLOW}   2. Atualize backend/Arc.API/appsettings.Development.json${NC}"
    echo -e "${YELLOW}   3. Execute as migrations:${NC}"
    echo "      cd backend/Arc.API"
    echo "      dotnet ef database update"
    echo ""
    
    echo -e "${GREEN}✅ Setup manual concluído!${NC}"
    echo ""
    echo -e "${CYAN}🚀 Para iniciar:${NC}"
    echo ""
    echo "   Terminal 1 (Backend):"
    echo "   cd backend/Arc.API"
    echo "   dotnet watch run"
    echo ""
    echo "   Terminal 2 (Frontend):"
    echo "   cd frontend"
    echo "   npm run dev"
    echo ""
    
else
    echo -e "${RED}❌ Opção inválida!${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}📚 Mais informações: Veja DEV-SETUP.md${NC}"
echo -e "${CYAN}=============================================${NC}"
