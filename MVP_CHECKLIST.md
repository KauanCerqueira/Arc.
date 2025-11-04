# MVP Checklist - Arc. Projectly

## Status Atual
- **Templates Frontend**: 28 implementados
- **Backend Controllers**: 22 implementados, **0 FALTANDO**
- **Funcionalidades Core**: 80% completas
- **Sistema de Pagamentos**: 0% (apenas tipos)
- **Autenticação**: 70% (falta OAuth, password reset, email verification)

---

## 📋 O QUE FAZER EM CADA TEMPLATE

### ✅ Templates COM Backend Completo

Estes templates já têm controllers + services + DTOs. Você só precisa **importar os dados manualmente**.

#### 1. **Kanban** ✅
- **Backend**: `KanbanController` + `KanbanService` + `KanbanDto`
- **Endpoints**: GET, POST, PUT, DELETE `/api/kanban`
- **O que fazer**: Criar colunas e cards via interface

#### 2. **Tasks** ⚠️
- **Backend**: `TasksController` (SEM SERVICE)
- **Endpoints**: GET, POST, PUT, DELETE `/api/tasks`
- **O que fazer**:
  1. Criar `TasksService.cs`
  2. Implementar lógica de negócio
  3. Criar tasks via interface

#### 3. **Table** ⚠️
- **Backend**: `TableController` (SEM SERVICE)
- **Endpoints**: GET, POST, PUT, DELETE `/api/table`
- **O que fazer**:
  1. Criar `TableService.cs`
  2. Implementar validações
  3. Criar tabelas via interface

#### 4. **Roadmap** ✅
- **Backend**: `RoadmapController` + `RoadmapService` + `RoadmapDto`
- **Endpoints**: GET, POST, PUT, DELETE `/api/roadmap`
- **O que fazer**: Criar milestones via interface

#### 5. **Calendar** ✅
- **Backend**: `CalendarController` + `CalendarService` + `CalendarEventDto`
- **Endpoints**: GET, POST, PUT, DELETE `/api/calendar`
- **O que fazer**: Criar eventos via interface

#### 6. **Wiki** ✅
- **Backend**: `WikiController` + `WikiService` + `WikiPageDto`
- **Endpoints**: GET, POST, PUT, DELETE `/api/wiki`
- **O que fazer**: Criar páginas wiki via interface

#### 7. **Documents** ✅
- **Backend**: `DocumentsController` + `DocumentsService` + `DocumentDto`
- **Endpoints**: GET, POST, PUT, DELETE `/api/documents`
- **O que fazer**: Criar documentos via interface

#### 8. **Projects** ⚠️
- **Backend**: `ProjectsController` (SEM SERVICE)
- **Endpoints**: GET, POST, PUT, DELETE `/api/projects`
- **O que fazer**:
  1. Criar `ProjectsService.cs`
  2. Implementar lógica
  3. Criar projetos via interface

#### 9. **Bugs** ⚠️
- **Backend**: `BugsController` (SEM SERVICE)
- **Endpoints**: GET, POST, PUT, DELETE `/api/bugs`
- **O que fazer**:
  1. Criar `BugsService.cs`
  2. Implementar lógica
  3. Criar bugs via interface

#### 10. **Sprint** ⚠️
- **Backend**: `SprintController` (SEM SERVICE)
- **Endpoints**: GET, POST, PUT, DELETE `/api/sprint`
- **O que fazer**:
  1. Criar `SprintService.cs`
  2. Implementar lógica
  3. Criar sprints via interface

#### 11. **Study** ⚠️
- **Backend**: `StudyController` (SEM SERVICE)
- **Endpoints**: GET, POST, PUT, DELETE `/api/study`
- **O que fazer**:
  1. Criar `StudyService.cs`
  2. Implementar lógica
  3. Criar materiais de estudo via interface

#### 12. **Budget** ⚠️
- **Backend**: `BudgetController` (SEM SERVICE - genérico)
- **Endpoints**: GET, POST, PUT, DELETE `/api/budget`
- **O que fazer**:
  1. Criar `BudgetService.cs`
  2. Implementar lógica
  3. Criar orçamentos via interface

#### 13. **Focus (Pomodoro)** ⚠️
- **Backend**: `FocusController` (SEM SERVICE)
- **Endpoints**: GET, POST, PUT, DELETE `/api/focus`
- **O que fazer**:
  1. Criar `FocusService.cs`
  2. Implementar lógica de sessões
  3. Usar timer via interface

#### 14. **Flowchart** ✅
- **Backend**: `FlowchartController` + `FlowchartService` + `FlowchartDto`
- **Endpoints**: GET, POST, PUT, DELETE `/api/flowchart`
- **O que fazer**: Criar fluxogramas via interface

---

### ❌ Templates SEM Backend (8 controllers + services faltando)

Estes templates **NÃO têm backend**. Você precisa criar controller + service + DTOs para cada um.

#### 15. **Dashboard** ❌
- **Backend**: FALTANDO
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/Dashboard/DashboardDto.cs
  public class DashboardDto
  {
      public Guid PageId { get; set; }
      public List<DashboardWidget> Widgets { get; set; }
      public string Layout { get; set; } // "grid" | "flexible"
  }

  public class DashboardWidget
  {
      public string Id { get; set; }
      public string Type { get; set; } // "stats" | "chart" | "progress" | "metric"
      public string Title { get; set; }
      public string Value { get; set; }
      public object Config { get; set; }
  }

  // Backend/Arc.Application/Services/DashboardService.cs
  // Backend/Arc.API/Controllers/DashboardController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/dashboard/{pageId}` - Buscar dashboard
  - POST `/api/dashboard` - Criar dashboard
  - PUT `/api/dashboard/{pageId}` - Atualizar widgets/layout
  - DELETE `/api/dashboard/{pageId}` - Deletar dashboard
- **Depois**: Criar dashboard via interface

#### 16. **Mindmap** ❌
- **Backend**: FALTANDO
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/Mindmap/MindmapDto.cs
  public class MindmapDto
  {
      public Guid PageId { get; set; }
      public List<MindmapNode> Nodes { get; set; }
      public List<MindmapConnection> Connections { get; set; }
  }

  public class MindmapNode
  {
      public string Id { get; set; }
      public string Label { get; set; }
      public double X { get; set; }
      public double Y { get; set; }
      public string Color { get; set; }
  }

  public class MindmapConnection
  {
      public string Id { get; set; }
      public string FromId { get; set; }
      public string ToId { get; set; }
  }

  // Backend/Arc.Application/Services/MindmapService.cs
  // Backend/Arc.API/Controllers/MindmapController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/mindmap/{pageId}` - Buscar mindmap
  - POST `/api/mindmap` - Criar mindmap
  - PUT `/api/mindmap/{pageId}` - Atualizar nodes/connections
  - DELETE `/api/mindmap/{pageId}` - Deletar mindmap
- **Depois**: Criar mindmap via interface

#### 17. **Notes** ❌
- **Backend**: FALTANDO
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/Notes/NotesDto.cs
  public class NotesDto
  {
      public Guid PageId { get; set; }
      public List<Note> Notes { get; set; }
  }

  public class Note
  {
      public string Id { get; set; }
      public string Title { get; set; }
      public string Content { get; set; }
      public List<string> Tags { get; set; }
      public DateTime CreatedAt { get; set; }
      public DateTime UpdatedAt { get; set; }
  }

  // Backend/Arc.Application/Services/NotesService.cs
  // Backend/Arc.API/Controllers/NotesController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/notes/{pageId}` - Buscar notas
  - POST `/api/notes` - Criar nota
  - PUT `/api/notes/{noteId}` - Atualizar nota
  - DELETE `/api/notes/{noteId}` - Deletar nota
- **Depois**: Criar notas via interface

#### 18. **Timeline** ❌
- **Backend**: FALTANDO
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/Timeline/TimelineDto.cs
  public class TimelineDto
  {
      public Guid PageId { get; set; }
      public List<TimelineEvent> Events { get; set; }
  }

  public class TimelineEvent
  {
      public string Id { get; set; }
      public string Title { get; set; }
      public string Description { get; set; }
      public DateTime Date { get; set; }
      public string Category { get; set; }
      public string Color { get; set; }
  }

  // Backend/Arc.Application/Services/TimelineService.cs
  // Backend/Arc.API/Controllers/TimelineController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/timeline/{pageId}` - Buscar timeline
  - POST `/api/timeline` - Criar timeline
  - PUT `/api/timeline/{eventId}` - Atualizar evento
  - DELETE `/api/timeline/{eventId}` - Deletar evento
- **Depois**: Criar eventos via interface

#### 19. **Workout** ❌
- **Backend**: FALTANDO
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/Workout/WorkoutDto.cs
  public class WorkoutDto
  {
      public Guid PageId { get; set; }
      public List<WorkoutSession> Sessions { get; set; }
  }

  public class WorkoutSession
  {
      public string Id { get; set; }
      public DateTime Date { get; set; }
      public List<Exercise> Exercises { get; set; }
  }

  public class Exercise
  {
      public string Name { get; set; }
      public int Sets { get; set; }
      public int Reps { get; set; }
      public double Weight { get; set; }
      public string Notes { get; set; }
  }

  // Backend/Arc.Application/Services/WorkoutService.cs
  // Backend/Arc.API/Controllers/WorkoutController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/workout/{pageId}` - Buscar workouts
  - POST `/api/workout` - Criar sessão
  - PUT `/api/workout/{sessionId}` - Atualizar sessão
  - DELETE `/api/workout/{sessionId}` - Deletar sessão
- **Depois**: Criar treinos via interface

#### 20. **Nutrition** ❌
- **Backend**: FALTANDO
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/Nutrition/NutritionDto.cs
  public class NutritionDto
  {
      public Guid PageId { get; set; }
      public List<MealLog> Meals { get; set; }
      public DailyGoals Goals { get; set; }
  }

  public class MealLog
  {
      public string Id { get; set; }
      public DateTime Date { get; set; }
      public string MealType { get; set; } // "breakfast" | "lunch" | "dinner" | "snack"
      public List<FoodItem> Foods { get; set; }
  }

  public class FoodItem
  {
      public string Name { get; set; }
      public int Calories { get; set; }
      public double Protein { get; set; }
      public double Carbs { get; set; }
      public double Fat { get; set; }
  }

  public class DailyGoals
  {
      public int Calories { get; set; }
      public double Protein { get; set; }
      public double Carbs { get; set; }
      public double Fat { get; set; }
  }

  // Backend/Arc.Application/Services/NutritionService.cs
  // Backend/Arc.API/Controllers/NutritionController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/nutrition/{pageId}` - Buscar refeições
  - POST `/api/nutrition` - Criar refeição
  - PUT `/api/nutrition/{mealId}` - Atualizar refeição
  - DELETE `/api/nutrition/{mealId}` - Deletar refeição
- **Depois**: Criar refeições via interface

#### 21. **Personal Budget** ❌
- **Backend**: FALTANDO (diferente do BudgetController genérico)
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/PersonalBudget/PersonalBudgetDto.cs
  public class PersonalBudgetDto
  {
      public Guid PageId { get; set; }
      public List<Transaction> Transactions { get; set; }
      public List<Category> Categories { get; set; }
      public MonthlyGoals Goals { get; set; }
  }

  public class Transaction
  {
      public string Id { get; set; }
      public string Type { get; set; } // "income" | "expense"
      public double Amount { get; set; }
      public string Category { get; set; }
      public string Description { get; set; }
      public DateTime Date { get; set; }
  }

  // Backend/Arc.Application/Services/PersonalBudgetService.cs
  // Backend/Arc.API/Controllers/PersonalBudgetController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/personal-budget/{pageId}` - Buscar orçamento pessoal
  - POST `/api/personal-budget` - Criar transação
  - PUT `/api/personal-budget/{transactionId}` - Atualizar transação
  - DELETE `/api/personal-budget/{transactionId}` - Deletar transação
- **Depois**: Criar transações via interface

#### 22. **Business Budget** ❌
- **Backend**: FALTANDO
- **O que criar**:
  ```csharp
  // Backend/Arc.Application/DTOs/BusinessBudget/BusinessBudgetDto.cs
  public class BusinessBudgetDto
  {
      public Guid PageId { get; set; }
      public List<BusinessTransaction> Transactions { get; set; }
      public List<Project> Projects { get; set; }
      public double MRR { get; set; }
  }

  public class BusinessTransaction
  {
      public string Id { get; set; }
      public string Type { get; set; } // "revenue" | "expense"
      public double Amount { get; set; }
      public string Category { get; set; }
      public string ProjectId { get; set; }
      public DateTime Date { get; set; }
  }

  // Backend/Arc.Application/Services/BusinessBudgetService.cs
  // Backend/Arc.API/Controllers/BusinessBudgetController.cs
  ```
- **Endpoints necessários**:
  - GET `/api/business-budget/{pageId}` - Buscar orçamento empresarial
  - POST `/api/business-budget` - Criar transação
  - PUT `/api/business-budget/{transactionId}` - Atualizar transação
  - DELETE `/api/business-budget/{transactionId}` - Deletar transação
- **Depois**: Criar transações via interface

---

## 🔴 PRIORIDADES PARA MVP

### Sprint 1 (5-7 dias) - BACKEND FALTANDO

Criar controllers + services + DTOs para os 8 templates sem backend:

- [x] **DashboardController** + DashboardService (1 dia)
- [x] **MindmapController** + MindmapService (1 dia)
- [x] **NotesController** + NotesService (0.5 dia)
- [x] **TimelineController** + TimelineService (0.5 dia)
- [x] **WorkoutController** + WorkoutService (1 dia)
- [x] **NutritionController** + NutritionService (1 dia)
- [x] **PersonalBudgetController** + PersonalBudgetService (1 dia)
- [x] **BusinessBudgetController** + BusinessBudgetService (1 dia)

Criar services para controllers existentes:

- [x] **TasksService** (0.5 dia)
- [x] **TableService** (0.5 dia)
- [x] **ProjectsService** (0.5 dia)
- [x] **BugsService** (0.5 dia)
- [x] **StudyService** (0.5 dia)
- [x] **BudgetService** (0.5 dia)
- [x] **SprintService** (0.5 dia)
- [x] **FocusService** (0.5 dia)

**Total: 7-9 dias**

### Sprint 2 (1-2 dias) - IMPORTAR DADOS

Agora que o backend está pronto, importar dados manualmente via interface:

- [ ] Criar workspace "Arc. - Desenvolvimento"
- [ ] Criar 7 grupos (MVP, Backend Dev, Frontend Dev, Product, Marketing, Finance, DevOps)
- [ ] Criar 20-30 páginas usando todos os templates
- [ ] Popular cada página com dados reais do projeto

**Total: 1-2 dias**

### Sprint 3 (3-4 dias) - UX & PAGAMENTOS

- [ ] Empty states em todas as páginas
- [ ] 404 e 500 error pages
- [ ] Skeleton loaders
- [ ] Stripe integration básica
- [ ] Validação de limites por plano
- [ ] Toast notifications

**Total: 3-4 dias**

### Sprint 4 (2-3 dias) - AUTH & DEPLOY

- [ ] Email verification
- [ ] Password reset
- [ ] Configurar env vars de produção
- [ ] Deploy backend + frontend
- [ ] Health checks

**Total: 2-3 dias**

---

## 📊 RESUMO

**Total estimado para MVP completo**: 6-9 dias

### O que já está pronto:
- ✅ 14 templates com backend completo
- ✅ Autenticação JWT
- ✅ Workspaces, grupos, páginas
- ✅ Team management
- ✅ Permissões de grupo
- ✅ Busca global
- ✅ Favoritos
- ✅ Analytics admin
- ✅ Master panel
- ✅ Promo codes

### O que falta:
1. Importar dados manualmente
2. Empty states & error handling
3. Stripe integration
4. Email services

**O projeto está ~75% pronto para MVP!**

Foque em criar os backends faltando primeiro, depois importe os dados manualmente usando a interface.
