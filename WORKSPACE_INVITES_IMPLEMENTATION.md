# Sistema de Convites para Workspace - Implementação Completa

## 📋 Resumo

Sistema completo de convites para workspace implementado no frontend (React/Next.js) e backend (C#/.NET).

## ✅ O que foi implementado

### Frontend

1. **Tipos e DTOs** (`frontend/src/core/types/workspace.types.ts`)
   - `WorkspaceRole`: owner, admin, member, viewer
   - `WorkspaceMember`: Membros do workspace
   - `WorkspaceInvite`: Estrutura completa de convites

2. **Serviço de Convites** (`frontend/src/core/services/workspace-invite.service.ts`)
   - `createInvite()`: Cria novo link de convite
   - `listInvites()`: Lista convites ativos
   - `validateInvite()`: Valida token (público)
   - `acceptInvite()`: Aceita convite (autenticado)
   - `revokeInvite()`: Revoga convite
   - `generateInviteUrl()`: Gera URL completa

3. **UI de Gestão** (`frontend/src/app/(workspace)/workspace/settings/page.tsx`)
   - Modal para criar novos convites com:
     - Seleção de permissão (Visualizador, Membro, Admin)
     - Expiração em dias
     - Limite de usos
   - Lista de convites ativos com:
     - Informações de uso
     - Botão copiar link
     - Botão revogar

4. **Página de Aceitação** (`frontend/src/app/invite/[token]/page.tsx`)
   - Validação automática do token
   - Fluxo para usuários não autenticados
   - Fluxo para usuários autenticados
   - Tratamento de erros

5. **Integração com Registro** (`frontend/src/app/(auth)/register/page.tsx`)
   - Detecta parâmetro `?invite=token`
   - Redireciona após registro

### Backend

1. **Entidade Atualizada** (`Arc.Domain/Entities/WorkspaceInvitation.cs`)
   ```csharp
   - MaxUses (int?): Limite de usos (null = ilimitado)
   - CurrentUses (int): Contador de usos
   - IsActive (bool): Se o convite está ativo
   - CanBeUsed(): Método para validar se pode ser usado
   ```

2. **DTOs** (`Arc.Application/DTOs/Workspace/InviteDtos.cs`)
   - `CreateInviteRequestDto`
   - `CreateInviteResponseDto`
   - `ValidateInviteResponseDto`
   - `AcceptInviteResponseDto`
   - `WorkspaceInviteDto`
   - `WorkspaceMemberDto`

3. **Serviço** (`Arc.Application/Services/WorkspaceInviteService.cs`)
   - `CreateInviteAsync()`: Cria convite (verifica permissões)
   - `GetInvitesAsync()`: Lista convites do workspace
   - `ValidateInviteAsync()`: Valida token (público)
   - `AcceptInviteAsync()`: Aceita e adiciona membro
   - `RevokeInviteAsync()`: Revoga convite
   - `GetMembersAsync()`: Lista membros

4. **Controller** (`Arc.Api/Controllers/Workspace/WorkspaceInviteController.cs`)

   **Endpoints Autenticados:**
   ```
   POST   /api/workspaces/{workspaceId}/invites
   GET    /api/workspaces/{workspaceId}/invites
   DELETE /api/workspaces/{workspaceId}/invites/{inviteId}
   GET    /api/workspaces/{workspaceId}/members
   ```

   **Endpoints Públicos:**
   ```
   GET    /api/invites/{token}/validate
   POST   /api/invites/{token}/accept  (requer auth)
   ```

5. **Banco de Dados**
   - DbContext atualizado com novos campos
   - Migration SQL criada (`20250123_AddInviteFields.sql`)

## 🚀 Como Usar

### 1. Aplicar Migration no Banco

```bash
# No PostgreSQL
psql -U seu_usuario -d arc_db -f backend/Arc.Infrastructure/Migrations/20250123_AddInviteFields.sql
```

Ou usando Entity Framework:
```bash
cd backend/Arc.Api
dotnet ef migrations add AddInviteFields
dotnet ef database update
```

### 2. Configurar BaseUrl no appsettings.json

```json
{
  "AppSettings": {
    "BaseUrl": "http://localhost:3000"
  }
}
```

### 3. Executar Backend

```bash
cd backend/Arc.Api
dotnet run
```

### 4. Executar Frontend

```bash
cd frontend
npm run dev
```

## 📝 Fluxo de Uso

### Criar Convite

1. Admin/Owner vai em **Workspace Settings** → **Membros**
2. Clica em **"Gerar Link"**
3. Configura:
   - Permissão (Visualizador, Membro, Admin)
   - Expiração (1-365 dias ou ilimitado)
   - Limite de usos (ou ilimitado)
4. Clica em **"Gerar Link"**
5. Copia o link gerado

### Aceitar Convite (Novo Usuário)

1. Acessa o link do convite
2. Clica em **"Criar Conta e Aceitar"**
3. Preenche formulário de registro
4. É redirecionado para aceitar o convite
5. Automaticamente entra no workspace

### Aceitar Convite (Usuário Existente)

1. Acessa o link do convite
2. Clica em **"Já tenho conta"**
3. Faz login
4. Clica em **"Aceitar Convite"**
5. Entra no workspace

### Gerenciar Convites

1. Admin/Owner vai em **Workspace Settings** → **Membros**
2. Vê lista de convites ativos com:
   - Permissão
   - Usos (atual/máximo)
   - Data de expiração
3. Pode:
   - Copiar link novamente
   - Revogar convite

## 🔒 Segurança

- ✅ Tokens URL-safe gerados automaticamente
- ✅ Verificação de permissões (apenas Owner/Admin podem criar/revogar)
- ✅ Validação de expiração
- ✅ Limite de usos configurável
- ✅ Sistema de revogação
- ✅ Verificação de membro duplicado

## 🧪 Testes Sugeridos

### Backend
```csharp
// Testar criação de convite
// Testar validação de convite
// Testar aceitação de convite
// Testar limite de usos
// Testar expiração
// Testar revogação
// Testar permissões
```

### Frontend
```typescript
// Testar geração de link
// Testar cópia de link
// Testar validação de token
// Testar fluxo de registro com convite
// Testar fluxo de login com convite
// Testar aceitação de convite
// Testar lista de membros
```

## 📚 Estrutura de Arquivos

```
frontend/
├── src/
│   ├── core/
│   │   ├── types/workspace.types.ts           (Tipos atualizados)
│   │   └── services/
│   │       └── workspace-invite.service.ts    (Serviço de convites)
│   └── app/
│       ├── (workspace)/
│       │   └── workspace/settings/page.tsx    (UI de gestão)
│       ├── invite/[token]/page.tsx            (Página de aceitação)
│       └── (auth)/register/page.tsx           (Integração com registro)

backend/
├── Arc.Domain/
│   └── Entities/
│       └── WorkspaceInvitation.cs             (Entidade atualizada)
├── Arc.Application/
│   ├── DTOs/Workspace/
│   │   └── InviteDtos.cs                      (DTOs)
│   └── Services/
│       └── WorkspaceInviteService.cs          (Serviço)
├── Arc.Api/
│   ├── Controllers/Workspace/
│   │   └── WorkspaceInviteController.cs       (Controller)
│   └── Program.cs                             (DI configurado)
└── Arc.Infrastructure/
    ├── Data/AppDbContext.cs                   (DbContext atualizado)
    └── Migrations/
        └── 20250123_AddInviteFields.sql       (Migration)
```

## 🎯 Próximos Passos (Opcional)

- [ ] Notificações por email ao aceitar convite
- [ ] Dashboard de analytics de convites
- [ ] Convites com mensagem personalizada
- [ ] Convites específicos por email (além de link)
- [ ] Histórico de convites aceitos
- [ ] Limite de membros por workspace
- [ ] Diferentes templates de convite

## 🐛 Troubleshooting

### Token inválido mesmo sendo válido
- Verificar se a migração foi aplicada corretamente
- Verificar se o campo `is_active` está `true`

### Erro ao aceitar convite
- Verificar se o usuário já não é membro
- Verificar se o convite não expirou
- Verificar se não atingiu o limite de usos

### Link não funciona
- Verificar se `BaseUrl` está configurado corretamente no backend
- Verificar se o token está correto na URL

---

**Desenvolvido por Claude Code** 🤖
Data: 23 de Janeiro de 2025
