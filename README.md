# Arc. - Sistema de Gestão de Projetos

Sistema completo de gestão de projetos e produtividade pessoal com múltiplos templates e workspaces.

## 🚀 Tecnologias

### Backend
- **.NET 8.0** - Framework principal
- **PostgreSQL** - Banco de dados
- **Entity Framework Core** - ORM
- **JWT** - Autenticação
- **Swagger** - Documentação da API

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
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

### Gerenciamento
- ✅ Autenticação JWT completa
- ✅ Workspaces e grupos
- ✅ Páginas dinâmicas
- ✅ Sistema de busca
- ✅ Perfil e configurações de usuário

### Templates Disponíveis
- ✅ **Tasks** - Gerenciamento de tarefas
- ✅ **Kanban** - Quadro kanban com colunas
- ✅ **Calendar** - Calendário de eventos
- ✅ **Table** - Tabelas dinâmicas
- ✅ **Projects** - Gerenciamento de projetos
- ✅ **Bugs** - Rastreamento de bugs
- ✅ **Study** - Controle de estudos
- ✅ **Budget** - Controle financeiro
- ✅ **Sprint** - Gerenciamento de sprints
- ✅ **Focus** - Timer Pomodoro
- ✅ **Flowchart** - Diagramas de fluxo
- ✅ **Roadmap** - Roadmap de produtos
- ✅ **Documents** - Gerenciamento de documentos
- ✅ **Blank** - Página em branco personalizável

## 🔧 Configuração

### Pré-requisitos
- .NET 8.0 SDK
- Node.js 18+
- PostgreSQL 14+

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
```

O frontend estará disponível em http://localhost:3000

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

#### Templates
Cada template tem sua própria controller:
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
- `/api/blank` - Páginas em branco

## 🔒 Segurança

- Autenticação JWT com tokens de 60 minutos
- Rate limiting configurado
- CORS configurado para origens específicas
- Validação de dados em todos os endpoints
- Senhas com hash BCrypt

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Kauan Cerqueira**

---

Desenvolvido com 💙 usando .NET e Next.js
