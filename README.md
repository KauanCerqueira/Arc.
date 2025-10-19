# ?? Projectly

Sistema de produtividade pessoal com metodologias dinâmicas.

## ?? Sobre o Projeto

O Projectly é uma plataforma de produtividade pessoal que permite aos usuários gerenciar seus projetos usando diferentes metodologias de trabalho (Kanban, Pomodoro, GTD, Estudo).

## ??? Tecnologias

### Frontend
- **Next.js 15.5** - Framework React com App Router
- **React 19.2** - Biblioteca UI (última versão estável)
- **TypeScript 5.9** - Tipagem estática
- **Tailwind CSS 3.4** - Estilização utility-first
- **Zustand 4.5** - Gerenciamento de estado
- **Lucide React** - Ícones
- **Framer Motion 11** - Animações

### Backend (próxima etapa)
- **.NET 8** - Framework backend
- **PostgreSQL** - Banco de dados
- **EF Core** - ORM
- **Identity** - Autenticação
- **JWT** - Tokens de autenticação

## ?? Estrutura do Projeto

```
Projectly/
+-- src/
¦   +-- app/                    # Páginas e rotas (App Router)
¦   ¦   +-- (auth)/            # Rotas de autenticação
¦   ¦   +-- (dashboard)/       # Rotas do dashboard
¦   ¦   +-- project/[id]/      # Página dinâmica de projeto
¦   +-- features/              # Funcionalidades isoladas
¦   ¦   +-- auth/
¦   ¦   +-- tasks/
¦   ¦   +-- projects/
¦   ¦   +-- methodologies/
¦   +-- core/                  # Configurações e utils
¦   +-- shared/                # Componentes compartilhados
+-- public/                    # Arquivos estáticos
```

## ?? Como Executar

### Pré-requisitos
- Node.js 18+ ou 20+ (recomendado)
- npm, yarn ou pnpm

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

3. Acesse no navegador:
```
http://localhost:3000
```

## ?? Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (com Turbopack)
- `npm run build` - Cria build de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## ?? Funcionalidades

- ? Autenticação de usuários
- ? Dashboard com estatísticas
- ? Gerenciamento de tarefas
- ? Criação de projetos
- ? Múltiplas metodologias (Kanban, Pomodoro, GTD, Estudo)
- ? Configurações de perfil
- ? Interface responsiva e moderna

## ?? Novidades das Versões Atualizadas

### Next.js 15.5
- Turbopack habilitado por padrão (builds até 5-10x mais rápidos)
- Melhorias no sistema de roteamento
- Suporte aprimorado ao React 19

### React 19.2
- Novos hooks: `useActionState`, `useFormStatus`, `useOptimistic`
- Actions API para gerenciamento de forms
- Melhor suporte a Server Components
- Performance melhorada

### TypeScript 5.9
- Melhorias no `tsc --init`
- Melhor inferência de tipos
- Performance otimizada

## ?? Próximos Passos

1. Conectar com backend .NET 8
2. Implementar Zustand stores
3. Adicionar visualizações dinâmicas por metodologia
4. Implementar drag and drop no Kanban
5. Adicionar timer do Pomodoro
6. Sistema de análise de viabilidade de projetos

## ?? Atualizando Dependências

Para manter as dependências atualizadas:
```bash
npm update
```

Para verificar versões desatualizadas:
```bash
npm outdated
```

## ?? Licença

Este projeto está sob a licença MIT.

## ????? Desenvolvido com

- ?? Paixão por código limpo
- ? Next.js 15 com Turbopack
- ?? Tailwind CSS para estilização moderna
- ?? As mais recentes tecnologias React
