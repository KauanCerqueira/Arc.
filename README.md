# Arc. - Plataforma Completa de Gestão e Produtividade

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?logo=postgresql)](https://www.postgresql.org/)

Sistema moderno e flexível de gestão de projetos e produtividade pessoal com **18+ templates especializados**, colaboração em equipe e workspaces personalizáveis. Uma alternativa completa a ferramentas como Notion, Trello e ClickUp.

## 📋 Índice

- [Casos de Uso](#-casos-de-uso)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Deployment](#-deployment)
- [Configuração](#-configuração)
- [Documentação da API](#-documentação-da-api)
- [Arquitetura](#-arquitetura)
- [Segurança](#-segurança)
- [Filosofia do Projeto](#-filosofia-do-projeto)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)

## 💼 Casos de Uso

- **Desenvolvedores**: Rastreamento de bugs, sprints ágeis, roadmaps de produto, fluxogramas de arquitetura
- **Estudantes**: Controle de estudos, calendário de provas, notas, mapas mentais, timer Pomodoro
- **Freelancers**: Gerenciamento de projetos, controle financeiro, tracking de tempo, documentação
- **Equipes**: Workspaces colaborativos, Kanban boards, dashboards compartilhados, wiki interna
- **Gestores de Produto**: Roadmaps, analytics, timelines, tabelas de feature requests
- **Pesquisadores**: Wiki de conhecimento, documentos, mind maps, timeline de experimentos

## 🚀 Tecnologias

### Backend
- **.NET 8.0** - Framework principal
- **PostgreSQL** - Banco de dados
- **Entity Framework Core** - ORM
- **JWT** - Autenticação
- **Swagger** - Documentação da API

### Frontend
- **Next.js 15** - Framework React (React 19)
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **@dnd-kit** - Drag and drop
- **ReactFlow** - Diagramas e fluxogramas
- **Recharts** - Gráficos e visualizações
- **Framer Motion** - Animações
- **Lucide Icons** - Ícones

## 📁 Estrutura do Projeto

```
Projectly/
├── backend/
│   ├── Arc.API/            # Controllers e configurações da API
│   ├── Arc.Application/    # Lógica de negócio e DTOs
│   ├── Arc.Domain/         # Entidades e interfaces
│   └── Arc.Infrastructure/ # Repositórios e contexto do banco
└── frontend/               # Aplicação Next.js
```

## 🎯 Funcionalidades

### Gerenciamento Core
- ✅ Autenticação JWT completa com refresh tokens
- ✅ **Workspaces** colaborativos com tipos (Individual, Team, Enterprise)
- ✅ **Grupos** organizacionais com hierarquia
- ✅ **Páginas** dinâmicas com 18+ templates
- ✅ Sistema de **busca global** avançado
- ✅ **Drag and drop** para reordenação de grupos e páginas
- ✅ Sistema de **favoritos** para acesso rápido
- ✅ Perfil e configurações de usuário (tema, idioma, timezone)

### Colaboração
- ✅ **Convites de workspace** com sistema de tokens
- ✅ Gerenciamento de **membros de equipe**
- ✅ **Permissões granulares** por grupo (visualizar, editar, deletar, gerenciar)
- ✅ Controle de acesso baseado em roles (Admin, Editor, Viewer)

### Templates Disponíveis (18+)
- ✅ **Blank** 📝 - Página em branco personalizável
- ✅ **Tasks** ✅ - Gerenciamento de tarefas com prioridades e tags
- ✅ **Kanban** 📋 - Quadro kanban com colunas customizáveis
- ✅ **Calendar** 📅 - Calendário de eventos com cores
- ✅ **Table** 📊 - Tabelas dinâmicas com tipos de coluna
- ✅ **Projects** 🎯 - Gerenciamento de projetos com status e progresso
- ✅ **Bugs** 🐛 - Rastreamento de bugs com níveis de severidade
- ✅ **Study** 📚 - Controle de estudos com tempo e progresso
- ✅ **Budget** 💰 - Controle financeiro com categorização
- ✅ **Sprint** 🏃 - Gerenciamento ágil de sprints com story points
- ✅ **Focus** 🔴 - Timer Pomodoro com tracking de sessões
- ✅ **Flowchart** 🔀 - Diagramas de fluxo interativos (ReactFlow)
- ✅ **Roadmap** 🗺️ - Timeline e roadmap visual
- ✅ **Documents** 📁 - Sistema de gerenciamento de documentos
- ✅ **Dashboard** 📊 - Dashboard customizável com widgets
- ✅ **Mindmap** 🧠 - Mapas mentais visuais
- ✅ **Notes** 🗒️ - Anotações rápidas
- ✅ **Timeline** ⏳ - Linha do tempo de eventos
- ✅ **Wiki** 📘 - Páginas estilo wiki para documentação

### Administração
- ✅ **Painel Master** para gerenciamento de usuários
- ✅ Sistema de **códigos promocionais**
- ✅ **Analytics dashboard** com métricas de uso
- ✅ **Build in Public** - Página de transparência com:
  - Número de usuários ativos
  - MRR (Monthly Recurring Revenue)
  - Custos mensais detalhados
  - KPIs (CAC, LTV, Churn, NPS)
  - Milestones e progresso
  - Timeline de atualizações

## 🚢 Deployment

### Docker & CI/CD
- **Docker**: Multi-stage builds para backend e frontend
- **Docker Compose**: Orquestração local completa (backend + frontend + PostgreSQL)
- **GitHub Actions**:
  - Build e push automático para Docker Hub
  - Deploy automático no Railway
- **Multi-arch**: Suporte para linux/amd64 e linux/arm64

### Opção 1: Docker Compose (Desenvolvimento Local)
```bash
# Clone e configure
git clone https://github.com/KauanCerqueira/Projectly.git
cd Projectly
cp .env.example .env

# Inicie todos os serviços
docker-compose up -d

# Acesse
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
# Swagger: http://localhost:5001/swagger
```

### Opção 2: Docker Hub (Produção)
```bash
# Pull das imagens
docker pull seu-username/projectly-backend:latest
docker pull seu-username/projectly-frontend:latest

# Execute com docker-compose ou kubernetes
```

### Opção 3: Railway (Cloud)
- Backend: Railway (API .NET + PostgreSQL)
- Frontend: Railway ou Vercel (Next.js)
- Deploy automático via GitHub Actions

## 🔧 Configuração

### Pré-requisitos
- .NET 8.0 SDK ou superior
- Node.js 18+ (recomendado 20+)
- PostgreSQL 14+
- Git

### Backend

1. Configure o banco de dados em `backend/Arc.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=arc;Username=postgres;Password=sua_senha"
  }
}
```

2. Execute as migrations:
```bash
cd backend/Arc.API
dotnet ef database update
```

3. Inicie a API:
```bash
dotnet run
```

A API estará disponível em:
- Swagger: http://localhost:5001
- HTTPS: https://localhost:7001

### Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Configure as variáveis de ambiente (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou use um dos scripts específicos:
npm run dev:local    # Configura ambiente local automaticamente
npm run dev:tunnel   # Configura para usar com túnel (ngrok, etc)
```

O frontend estará disponível em http://localhost:3000

**Scripts disponíveis:**
- `npm run build` - Build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter ESLint

## 📚 Documentação da API

Acesse a documentação Swagger em http://localhost:5001 após iniciar a API.

### Principais Endpoints

#### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obter perfil
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/password` - Atualizar senha

#### Workspaces
- `GET /api/workspace` - Listar workspaces
- `POST /api/workspace` - Criar workspace
- `PUT /api/workspace/{id}` - Atualizar workspace
- `DELETE /api/workspace/{id}` - Deletar workspace

#### Grupos e Páginas
- `GET/POST/PUT/DELETE /api/group` - Gerenciamento de grupos
- `GET/POST/PUT/DELETE /api/page` - Gerenciamento de páginas

#### Colaboração
- `GET/POST /api/team` - Gerenciamento de membros
- `GET/POST/DELETE /api/workspace-invitations` - Sistema de convites
- `GET/POST/PUT/DELETE /api/group-permissions` - Permissões granulares

#### Templates
Cada template tem endpoints CRUD próprios:
- `/api/blank` - Páginas em branco
- `/api/tasks` - Gerenciamento de tarefas
- `/api/kanban` - Quadro kanban
- `/api/calendar` - Eventos
- `/api/table` - Tabelas
- `/api/projects` - Projetos
- `/api/bugs` - Bugs
- `/api/study` - Estudos
- `/api/budget` - Orçamento
- `/api/sprint` - Sprints
- `/api/focus` - Sessões de foco
- `/api/flowchart` - Fluxogramas
- `/api/roadmap` - Roadmap
- `/api/documents` - Documentos
- `/api/dashboard` - Dashboards
- `/api/mindmap` - Mapas mentais
- `/api/notes` - Notas
- `/api/timeline` - Linhas do tempo
- `/api/wiki` - Wiki

#### Outros
- `GET /api/search` - Busca global no workspace
- `GET /api/analytics` - Métricas e analytics
- `GET/POST /api/promo-codes` - Códigos promocionais
- `GET /api/master/*` - Painel administrativo

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com separação em camadas:

```
Backend (.NET 8)
├── Arc.API            # Controllers, middleware, configuração HTTP
├── Arc.Application    # Lógica de negócio, DTOs, services
├── Arc.Domain         # Entidades, enums, interfaces de repositório
└── Arc.Infrastructure # EF Core, repositórios, acesso a dados

Frontend (Next.js 15)
├── app/              # App Router do Next.js (rotas e layouts)
├── core/             # Componentes, hooks, services, store
└── features/         # Módulos específicos por feature
```

**Modelo de Dados:**
- **Workspace → Groups → Pages** (hierarquia de 3 níveis)
- Armazenamento flexível: dados dos templates salvos como JSON
- Suporte a múltiplos tipos de workspace (Individual, Team, Enterprise)
- Permissões granulares por grupo e role-based access control

## 🔒 Segurança

- Autenticação JWT com tokens de **30 dias** + Refresh Token de **90 dias**
- Renovação automática de tokens (interceptor no frontend)
- Rate limiting configurado (5 req/min login, 3 req/min registro, 100 req/min geral)
- CORS configurado para origens específicas
- Validação de dados em todos os endpoints
- Senhas com hash BCrypt
- Health checks para monitoramento (`/health`, `/health/ready`)
- Controle de acesso baseado em roles (Admin, Editor, Viewer)
- Validação de tokens em convites de workspace
- Persistência de sessão com "Remember Me"

## 💡 Filosofia do Projeto

**Arc.** é um experimento em **produtos digitais sustentáveis**:

- **🌐 Transparência Total**: Página "Build in Public" mostra métricas reais, custos e receitas
- **♻️ Sustentabilidade**: Modelo bootstrap sem financiamento VC, foco em auto-sustentabilidade
- **🎨 Usabilidade**: Design minimalista inspirado em Notion, Trello e ClickUp
- **🤝 Comunidade**: Desenvolvimento com roadmap público e transparente

### Competidores
- **Notion** - Workspace all-in-one
- **Trello** - Quadros Kanban
- **ClickUp** - Gerenciamento de projetos
- **Pomofocus** - Timers Pomodoro

### Diferenciais
- ✅ Desenvolvimento transparente ("Build in Public")
- ✅ 18+ templates especializados em uma plataforma
- ✅ Flexibilidade total de personalização
- ✅ Modelo de negócio sustentável e independente
- ✅ Foco em produtividade e experiência do usuário

## 🗺️ Roadmap

### Em Desenvolvimento
- 🔄 Modo offline e sincronização
- 🔄 Aplicativo mobile (React Native)
- 🔄 API pública para integrações
- 🔄 Temas customizáveis avançados

### Planejado
- 📋 Exportação de dados (PDF, Markdown, JSON)
- 📋 Integrações (Google Calendar, Slack, GitHub)
- 📋 Automações e workflows
- 📋 Templates customizáveis pelo usuário
- 📋 Comentários e menções em páginas
- 📋 Histórico de versões e rollback
- 📋 Webhooks e notificações push

### Considerando
- 💭 AI Assistant para automação de tarefas
- 💭 Real-time collaboration (multiplayer editing)
- 💭 Marketplace de templates da comunidade
- 💭 White-label para empresas

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Áreas onde contribuições são especialmente bem-vindas:**
- 🐛 Correção de bugs
- 📝 Melhorias na documentação
- 🎨 Novos temas e personalizações
- 🚀 Novos templates
- 🌍 Traduções (i18n)
- ⚡ Otimizações de performance
- ✅ Testes automatizados

## ❓ FAQ

### Qual a diferença entre Arc. e Notion?
Arc. é focado em produtividade com templates especializados (18+), enquanto Notion é mais genérico. Arc. oferece uma experiência otimizada com templates prontos para diversos casos de uso.

### Como funciona o deployment?
O Arc. está disponível em versão cloud hospedada (Railway + Vercel) e pode ser configurado para diferentes ambientes de produção.

### Como os dados são armazenados?
Dados dos templates são armazenados como JSON no banco PostgreSQL, permitindo flexibilidade total. Todos os dados são criptografados em repouso.

### Existe limite de workspaces ou páginas?
Na versão self-hosted, não há limites. A versão cloud pode ter limites dependendo do plano escolhido.

### É possível exportar meus dados?
Atualmente em desenvolvimento. Em breve será possível exportar para JSON, Markdown e PDF.

### Existe aplicativo mobile?
Está no roadmap! Um app React Native está planejado para 2025.

## 🔗 Links Úteis

- **Documentação**: Em desenvolvimento
- **Build in Public**: `/build-in-public` (na aplicação)
- **API Docs**: `http://localhost:5001` (Swagger)
- **Roadmap Público**: Veja seção [Roadmap](#-roadmap)

## 📝 Licença

© 2025 Arc. Todos os direitos reservados.

## 👨‍💻 Autor

**Kauan Cerqueira**

- GitHub: [@KauanCerqueira](https://github.com/KauanCerqueira)

## 🙏 Agradecimentos

Inspirado por ferramentas incríveis como Notion, Trello e ClickUp.

---

**Desenvolvido com 💙 usando .NET 8 e Next.js 15**

Se este projeto foi útil, considere dar uma ⭐ no repositório!
