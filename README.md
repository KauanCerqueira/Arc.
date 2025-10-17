# ?? Projectly

Sistema de produtividade pessoal com metodologias din�micas.

## ??? Arquitetura

### Backend (Clean Architecture - 3 Camadas)
- **Domain**: Entidades e interfaces de neg�cio
- **Application**: Casos de uso, DTOs e valida��es
- **Infrastructure**: Implementa��es (EF Core, Identity, Repositories)
- **API**: Controllers e apresenta��o

### Frontend (Feature-Based Architecture)
- **Features**: Cada funcionalidade isolada com seus componentes, hooks e services
- **Core**: Utilit�rios e configura��es compartilhadas
- **Shared**: Componentes UI reutiliz�veis

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
