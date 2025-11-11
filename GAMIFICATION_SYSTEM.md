# Sistema de Gamificação - Projectly

Este documento descreve o sistema de gamificação completo implementado no Projectly, especialmente focado na página de Sprint Template.

## Visão Geral

O sistema de gamificação transforma a gestão de sprints em uma experiência interativa e motivadora, com:
- Sistema de pontos baseado em story points
- Rankings dinâmicos dos membros do workspace
- Conquistas e badges desbloqueáveis
- Sistema de níveis e experiência
- Métricas de performance e velocidade

## Arquitetura

### 1. Tipos e Definições (`gamification.types.ts`)

#### Conquistas (Achievements)
Sistema de conquistas em 5 níveis (bronze, prata, ouro, platina, diamante):

- **Velocista** ⚡ - Complete tarefas rapidamente
- **Acumulador** 💎 - Acumule story points
- **Consistente** 🔥 - Mantenha sequência de dias ativos
- **Primeiro Sangue** 🎯 - Seja o primeiro a completar tarefas
- **Caçador de Bugs** 🐛 - Resolva bugs críticos
- **Jogador de Equipe** 🤝 - Ajude em tarefas colaborativas
- **Mestre da Sprint** 🏆 - Complete todas tarefas atribuídas
- **Superação** 🚀 - Complete mais que o atribuído
- **Qualidade** ✨ - Mantenha baixa taxa de bugs
- **Ritmo Constante** 📈 - Contribua regularmente

#### Badges Especiais
Badges raros desbloqueáveis por feitos únicos:

- **Fundador** 👑 - Membro fundador do workspace
- **Perfeccionista** 💯 - Complete sprint com 100%
- **Speedrunner** ⏱️ - 5 tarefas em menos de 1h
- **Coruja Noturna** 🦉 - Tarefas após 22h
- **Madrugador** 🌅 - Tarefas antes das 7h
- **Maratonista** 🏃 - 10 tarefas em um dia
- **Mentor** 🎓 - Ajude 5 membros
- **Inovador** 💡 - Crie 10 features

#### Sistema de Níveis
- Fórmula: `level = floor(sqrt(experience / 100))`
- XP ganha por completar tarefas
- Cálculo baseado em story points, prioridade e velocidade

### 2. Serviços

#### `gamification.service.ts`
Lógica de cálculo de estatísticas e conquistas:

```typescript
// Calcula estatísticas de um usuário
calculateUserStats(userId, tasks, sprintHistory) -> UserStats

// Gera leaderboard ordenado por pontos
generateLeaderboard(userStatsArray) -> LeaderboardEntry[]

// Calcula pontos por tarefa (com multiplicadores)
calculateTaskPoints(storyPoints, completionTime, priority, type) -> number
```

#### `team.service.ts`
Busca membros do workspace via API:

```typescript
// Obtém informações do time
getTeam(workspaceId) -> WorkspaceTeam
```

### 3. Hooks Customizados

#### `useWorkspaceGamification.ts`
Hook principal que integra membros e gamificação:

```typescript
const {
  leaderboard,      // Ranking ordenado
  userStats,        // Mapa de estatísticas por usuário
  members,          // Membros do workspace
  isLoading,        // Estado de carregamento
  error,            // Erros de API
  refreshStats,     // Função para recalcular
} = useWorkspaceGamification(workspaceId, tasks, sprintHistory)
```

### 4. Componentes de UI

#### `AchievementCard.tsx`
Exibe conquistas com progresso:
- Versão compacta e completa
- Animações de desbloqueio
- Barra de progresso
- Cores por tier (bronze → diamante)

#### `BadgeDisplay.tsx` e `BadgeCollection.tsx`
Exibe badges individuais ou coleções:
- 4 raridades (comum, raro, épico, lendário)
- Efeitos de brilho e hover
- Empilhamento de badges

#### `Leaderboard.tsx`
Ranking visual dos membros:
- Top 3 destacado com medalhas
- Indicador de tendência (↑↓→)
- Badges e conquistas inline
- Destaque do usuário atual

#### `UserStatsCard.tsx`
Card de estatísticas detalhadas:
- Versão compacta e completa
- Nível e XP com barra de progresso
- Métricas: pontos, tarefas, streak, velocidade
- Conquistas desbloqueadas e em progresso

### 5. Página de Sprint Refatorada

A página `sprint.tsx` foi completamente reformulada:

#### Mudanças Principais
- ✅ Removidos todos os dados mockados
- ✅ Integração com workspace members real
- ✅ Hook de gamificação integrado
- ✅ Componentes reutilizáveis
- ✅ Identidade visual consistente
- ✅ Loading e error states
- ✅ Seleção de assignee real na modal de tarefas

#### Features
1. **Header da Sprint**
   - Nome e meta editáveis
   - Datas e countdown de dias
   - Barra de progresso animada

2. **Métricas em Cards**
   - Total de story points
   - Pontos concluídos (%)
   - Pontos em progresso
   - Pontos no backlog

3. **Lista de Tarefas**
   - Agrupadas por status (done, in-progress, backlog)
   - Tags coloridas
   - Prioridades com ícones
   - Story points
   - Assignee com avatar gerado

4. **Leaderboard Integrado**
   - Membros reais do workspace
   - Ranking por pontos
   - Níveis e badges
   - Destaque do usuário logado

5. **Conquistas do Usuário**
   - Top 3 conquistas desbloqueadas
   - Progresso visual

6. **Card de Velocidade**
   - Pontos por dia
   - Dias ativos
   - Tarefas completas

7. **Tags do Sprint**
   - Distribuição por tipo
   - Contagem de tarefas
   - Total de pontos

## Cálculo de Pontos

### Fórmula Base
```
basePoints = storyPoints * 10
```

### Multiplicadores

**Por Prioridade:**
- Urgente: 1.5x
- Alta: 1.3x
- Média: 1.1x
- Baixa: 1.0x

**Por Tipo:**
- Bug: 1.2x
- Feature: 1.1x
- Task: 1.0x

**Por Velocidade:**
- < 2h: 1.5x
- < 4h: 1.3x
- < 8h: 1.1x
- > 8h: 1.0x

### Exemplo
Tarefa de 8 story points, urgente, bug, completada em 1h:
```
8 * 10 * 1.5 * 1.2 * 1.5 = 216 pontos
```

## Identidade Visual

### Paleta de Cores (seguindo Tailwind config)
- **Background Primary**: #f6f4f0
- **Background Secondary**: #ffffff
- **Text Primary**: #222222
- **Text Secondary**: #666666
- **Border**: #e0ddd8

### Cores de Conquistas (Tiers)
- **Bronze**: from-amber-600 to-orange-700
- **Prata**: from-gray-300 to-gray-400
- **Ouro**: from-yellow-400 to-amber-500
- **Platina**: from-cyan-300 to-blue-400
- **Diamante**: from-purple-400 to-pink-500

### Cores de Badges (Raridade)
- **Comum**: from-gray-400 to-gray-500
- **Raro**: from-blue-400 to-cyan-500
- **Épico**: from-purple-400 to-pink-500
- **Lendário**: from-yellow-400 to-orange-500

## Integração com Backend

### Endpoints Utilizados
```
GET /workspaces/:workspaceId/team
└── Retorna membros do workspace com roles
```

### Dados Esperados
```typescript
interface WorkspaceTeam {
  workspace: WorkspaceDto
  members: WorkspaceMember[]
  invitations: WorkspaceInvitation[]
  permissions: {
    canInvite: boolean
    canRemove: boolean
    canManagePermissions: boolean
  }
}

interface WorkspaceMember {
  id: string
  userId: string
  userName: string
  userEmail: string
  userIcon: string | null
  role: TeamRole // Owner | Admin | Member
  joinedAt: string
  lastAccessAt: string | null
  isActive: boolean
}
```

## Próximos Passos (Sugestões)

### Backend
1. **Criar tabela de achievements**
   - Salvar conquistas desbloqueadas
   - Histórico de progressão

2. **Criar tabela de user_stats**
   - XP total
   - Nível
   - Streaks
   - Badges

3. **Endpoints de Sprint**
   ```
   POST /workspaces/:workspaceId/sprints
   GET /workspaces/:workspaceId/sprints/:sprintId
   PUT /workspaces/:workspaceId/sprints/:sprintId
   DELETE /workspaces/:workspaceId/sprints/:sprintId
   ```

4. **Endpoints de Tasks**
   ```
   POST /sprints/:sprintId/tasks
   PUT /sprints/:sprintId/tasks/:taskId
   DELETE /sprints/:sprintId/tasks/:taskId
   PATCH /sprints/:sprintId/tasks/:taskId/status
   ```

5. **Endpoint de Estatísticas**
   ```
   GET /workspaces/:workspaceId/gamification/stats
   GET /workspaces/:workspaceId/gamification/leaderboard
   GET /users/:userId/achievements
   ```

### Frontend
1. **Persistência de Sprint**
   - Salvar dados no backend
   - Sync em tempo real

2. **Notificações de Conquistas**
   - Toast ao desbloquear achievement
   - Animação especial

3. **Histórico de Sprints**
   - Lista de sprints antigas
   - Gráficos de evolução

4. **Perfil do Usuário**
   - Página de perfil com todas conquistas
   - Estatísticas históricas
   - Badges collection completa

5. **Dashboard de Analytics**
   - Gráfico de velocidade
   - Burndown chart
   - Distribuição de pontos

## Arquivos Criados

```
frontend/src/
├── core/
│   ├── types/
│   │   └── gamification.types.ts          # Tipos e definições
│   ├── services/
│   │   └── gamification.service.ts        # Lógica de cálculo
│   └── hooks/
│       └── useWorkspaceGamification.ts    # Hook principal
├── shared/
│   └── components/
│       └── gamification/
│           ├── AchievementCard.tsx        # Card de conquista
│           ├── BadgeDisplay.tsx           # Display de badge
│           ├── Leaderboard.tsx            # Ranking
│           ├── UserStatsCard.tsx          # Estatísticas
│           └── index.ts                   # Exports
└── app/
    └── (workspace)/
        └── templates/
            └── sprint.tsx                  # Página refatorada
```

## Como Usar

### 1. Na Página de Sprint
```typescript
import { useWorkspaceGamification } from '@/core/hooks/useWorkspaceGamification'
import { Leaderboard } from '@/shared/components/gamification'

const { leaderboard, userStats, members } = useWorkspaceGamification(
  workspaceId,
  tasks
)

<Leaderboard entries={leaderboard} currentUserId={user?.userId} />
```

### 2. Em Outras Páginas
```typescript
import {
  AchievementCard,
  BadgeDisplay,
  UserStatsCard,
} from '@/shared/components/gamification'

// Mostrar conquista
<AchievementCard achievement={achievement} />

// Mostrar badge
<BadgeDisplay badge={badge} size="lg" showName />

// Mostrar stats do usuário
<UserStatsCard
  stats={userStats}
  userName="João Silva"
  userAvatar="/avatar.jpg"
/>
```

## Observações Importantes

1. **Workspace ID**: Obtido automaticamente do `useWorkspaceStore()`
2. **User ID**: Obtido do `useAuth()` context
3. **Dados Mocka dos**: Removidos completamente - agora usa dados reais da API
4. **Responsivo**: Todos componentes são mobile-friendly
5. **Dark Mode**: Suporte completo ao tema escuro
6. **Performance**: Cálculos memoizados com `useMemo`
7. **Loading States**: Feedback visual durante carregamento

## Testando o Sistema

1. **Sem membros no workspace:**
   - Mostra estado vazio
   - Permite criar tarefas normalmente

2. **Com membros:**
   - Leaderboard aparece automaticamente
   - Pode atribuir tarefas aos membros
   - Estatísticas são calculadas em tempo real

3. **Completando tarefas:**
   - Pontos são calculados automaticamente
   - Leaderboard atualiza
   - Conquistas progridem

4. **Criando tarefas:**
   - Modal permite selecionar membro
   - Story points, prioridade e tags
   - Salva com timestamps

---

**Sistema implementado por**: Claude Code
**Data**: Janeiro 2025
**Versão**: 1.0.0
