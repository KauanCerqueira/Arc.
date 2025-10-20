# ?? arc.

Sistema de produtividade pessoal com metodologias din�micas.

## ?? Sobre o Projeto

O arc. � uma plataforma de produtividade pessoal que permite aos usu�rios gerenciar seus projetos usando diferentes metodologias de trabalho (Kanban, Pomodoro, GTD, Estudo).

## ??? Tecnologias

### Frontend
- **Next.js 15.5** - Framework React com App Router
- **React 19.2** - Biblioteca UI (�ltima vers�o est�vel)
- **TypeScript 5.9** - Tipagem est�tica
- **Tailwind CSS 3.4** - Estiliza��o utility-first
- **Zustand 4.5** - Gerenciamento de estado
- **Lucide React** - �cones
- **Framer Motion 11** - Anima��es

### Backend (pr�xima etapa)
- **.NET 8** - Framework backend
- **PostgreSQL** - Banco de dados
- **EF Core** - ORM
- **Identity** - Autentica��o
- **JWT** - Tokens de autentica��o

## ?? Estrutura do Projeto

```
arc./
+-- src/
�   +-- app/                    # P�ginas e rotas (App Router)
�   �   +-- (auth)/            # Rotas de autentica��o
�   �   +-- (dashboard)/       # Rotas do dashboard
�   �   +-- project/[id]/      # P�gina din�mica de projeto
�   +-- features/              # Funcionalidades isoladas
�   �   +-- auth/
�   �   +-- tasks/
�   �   +-- projects/
�   �   +-- methodologies/
�   +-- core/                  # Configura��es e utils
�   +-- shared/                # Componentes compartilhados
+-- public/                    # Arquivos est�ticos
```

## ?? Como Executar

### Pr�-requisitos
- Node.js 18+ ou 20+ (recomendado)
- npm, yarn ou pnpm

### Instala��o

1. Instale as depend�ncias:
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

## ?? Scripts Dispon�veis

- `npm run dev` - Inicia o servidor de desenvolvimento (com Turbopack)
- `npm run build` - Cria build de produ��o
- `npm start` - Inicia o servidor de produ��o
- `npm run lint` - Executa o linter

## ?? Funcionalidades

- ? Autentica��o de usu�rios
- ? Dashboard com estat�sticas
- ? Gerenciamento de tarefas
- ? Cria��o de projetos
- ? M�ltiplas metodologias (Kanban, Pomodoro, GTD, Estudo)
- ? Configura��es de perfil
- ? Interface responsiva e moderna

## ?? Novidades das Vers�es Atualizadas

### Next.js 15.5
- Turbopack habilitado por padr�o (builds at� 5-10x mais r�pidos)
- Melhorias no sistema de roteamento
- Suporte aprimorado ao React 19

### React 19.2
- Novos hooks: `useActionState`, `useFormStatus`, `useOptimistic`
- Actions API para gerenciamento de forms
- Melhor suporte a Server Components
- Performance melhorada

### TypeScript 5.9
- Melhorias no `tsc --init`
- Melhor infer�ncia de tipos
- Performance otimizada

## ?? Pr�ximos Passos

1. Conectar com backend .NET 8
2. Implementar Zustand stores
3. Adicionar visualiza��es din�micas por metodologia
4. Implementar drag and drop no Kanban
5. Adicionar timer do Pomodoro
6. Sistema de an�lise de viabilidade de projetos

## ?? Atualizando Depend�ncias

Para manter as depend�ncias atualizadas:
```bash
npm update
```

Para verificar vers�es desatualizadas:
```bash
npm outdated
```

## ?? Licen�a

Este projeto est� sob a licen�a MIT.

## ????? Desenvolvido com

- ?? Paix�o por c�digo limpo
- ? Next.js 15 com Turbopack
- ?? Tailwind CSS para estiliza��o moderna
- ?? As mais recentes tecnologias React
