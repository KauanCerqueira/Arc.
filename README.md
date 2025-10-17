# ?? Projectly

Sistema de produtividade pessoal com metodologias dinâmicas.

## ??? Arquitetura

### Backend (Clean Architecture - 3 Camadas)
- **Domain**: Entidades e interfaces de negócio
- **Application**: Casos de uso, DTOs e validações
- **Infrastructure**: Implementações (EF Core, Identity, Repositories)
- **API**: Controllers e apresentação

### Frontend (Feature-Based Architecture)
- **Features**: Cada funcionalidade isolada com seus componentes, hooks e services
- **Core**: Utilitários e configurações compartilhadas
- **Shared**: Componentes UI reutilizáveis

## ?? Como Executar

### Backend
\\\ash
cd backend
dotnet restore
dotnet ef database update --project Projectly.Infrastructure --startup-project Projectly.Api
cd Projectly.Api
dotnet run
\\\

### Frontend
\\\ash
cd frontend
npm install
npm run dev
\\\

## ?? Tecnologias

- **Backend**: .NET 8, PostgreSQL, EF Core, Identity, JWT
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
