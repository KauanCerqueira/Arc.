# 🚀 Guia Completo - Rodar Projeto Localmente

Este guia vai te ajudar a rodar o **Arc.** (Projectly) completamente local: Backend (.NET 8), Frontend (Next.js 15) e Banco de Dados (PostgreSQL).

---

## 📋 Pré-requisitos

### 1. **PostgreSQL** (Banco de Dados)
- ✅ Baixe e instale: https://www.postgresql.org/download/windows/
- Durante a instalação:
  - **Porta:** `5432` (padrão)
  - **Usuário:** `postgres`
  - **Senha:** Defina uma senha (ex: `postgres` ou `admin`)
  - Instale também o **pgAdmin** (vem junto) para gerenciar o banco

### 2. **.NET 8 SDK** (Backend)
- ✅ Baixe e instale: https://dotnet.microsoft.com/download/dotnet/8.0
- Após instalar, verifique:
  ```bash
  dotnet --version
  ```
  Deve retornar: `8.0.x`

### 3. **Node.js** (Frontend)
- ✅ Baixe e instale: https://nodejs.org/ (versão LTS recomendada)
- Após instalar, verifique:
  ```bash
  node --version
  npm --version
  ```

---

## 🗄️ PASSO 1: Configurar o Banco de Dados PostgreSQL

### 1.1. Criar o Banco de Dados

Abra o **pgAdmin** ou o terminal (psql):

```sql
-- Conecte-se ao PostgreSQL
psql -U postgres

-- Crie o banco de dados
CREATE DATABASE arc;

-- Confirme que foi criado
\l
```

Ou via **pgAdmin**:
1. Abra o pgAdmin
2. Conecte-se ao servidor local
3. Clique com botão direito em "Databases" → "Create" → "Database"
4. Nome: `arc`
5. Clique em "Save"

### 1.2. Atualizar Connection String no Backend

Abra o arquivo:
```
backend\Arc.API\appsettings.json
```

Atualize a connection string com **sua senha do PostgreSQL**:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=arc;Username=postgres;Password=SUA_SENHA_AQUI"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Jwt": {
    "Key": "super-secret-key-with-at-least-32-characters-for-security",
    "Issuer": "Arc.API",
    "Audience": "Arc.Client",
    "ExpirationMinutes": 60
  }
}
```

⚠️ **Importante:** Substitua `SUA_SENHA_AQUI` pela senha que você definiu ao instalar o PostgreSQL!

---

## ⚙️ PASSO 2: Configurar e Rodar o Backend (.NET)

### 2.1. Navegar até o diretório do backend

```bash
cd C:\Users\conta\source\repos\KauanCerqueira\Projectly\backend\Arc.API
```

### 2.2. Restaurar pacotes NuGet

```bash
dotnet restore
```

### 2.3. Rodar as Migrations (Criar tabelas no banco)

```bash
dotnet ef database update
```

Se o comando `dotnet ef` não for reconhecido, instale primeiro:
```bash
dotnet tool install --global dotnet-ef
```

Depois rode novamente:
```bash
dotnet ef database update
```

✅ **Sucesso:** Você verá mensagens criando as tabelas no banco `arc`.

### 2.4. Rodar o Backend

```bash
dotnet run
```

🎉 **Backend rodando!**
- API: `http://localhost:5001` ou `https://localhost:7001`
- Swagger UI: `http://localhost:5001/swagger`

**Deixe este terminal aberto!**

---

## 🎨 PASSO 3: Configurar e Rodar o Frontend (Next.js)

### 3.1. Navegar até o diretório do frontend

Abra um **NOVO terminal** (deixe o do backend rodando):

```bash
cd C:\Users\conta\source\repos\KauanCerqueira\Projectly\frontend
```

### 3.2. Instalar dependências

```bash
npm install
```

### 3.3. Configurar variáveis de ambiente

Crie/edite o arquivo `.env.local` na pasta `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME=Arc.
```

⚠️ **Importante:** Certifique-se de que a porta (`5001`) corresponde à porta que seu backend está rodando!

### 3.4. Rodar o Frontend

```bash
npm run dev
```

🎉 **Frontend rodando!**
- App: `http://localhost:3000`

**Deixe este terminal aberto também!**

---

## ✅ PASSO 4: Testar Tudo Funcionando

### 4.1. Verificar se tudo está rodando

Você deve ter **3 coisas rodando**:
1. ✅ **PostgreSQL** - Serviço rodando (porta 5432)
2. ✅ **Backend (.NET)** - API rodando (porta 5001)
3. ✅ **Frontend (Next.js)** - App rodando (porta 3000)

### 4.2. Acessar a aplicação

Abra o navegador e acesse:
```
http://localhost:3000
```

### 4.3. Criar sua primeira conta

1. Clique em "Registrar" ou "Sign Up"
2. Preencha os dados
3. Faça login
4. Pronto! 🎉

---

## 🐛 Problemas Comuns

### Problema 1: "Could not connect to the database"
**Solução:**
- Verifique se o PostgreSQL está rodando
- Verifique a senha no `appsettings.json`
- Teste a conexão no pgAdmin

### Problema 2: "Port 5001 already in use"
**Solução:**
```bash
# Matar processo na porta 5001 (Windows)
netstat -ano | findstr :5001
taskkill /PID [PID_NUMBER] /F

# Ou mude a porta em backend\Arc.API\Properties\launchSettings.json
```

### Problema 3: "Port 3000 already in use"
**Solução:**
```bash
# Matar processo na porta 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Ou rode em outra porta
npm run dev -- -p 3001
```

### Problema 4: "dotnet ef not found"
**Solução:**
```bash
dotnet tool install --global dotnet-ef
dotnet tool update --global dotnet-ef
```

### Problema 5: Frontend não conecta ao Backend (CORS)
**Solução:**
O backend já está configurado para aceitar `localhost:3000`. Se mudar a porta do frontend, atualize o CORS em:
```
backend\Arc.API\Program.cs
```

Procure por:
```csharp
options.AddPolicy("AllowSpecificOrigins",
    builder => builder
        .WithOrigins("http://localhost:3000", ...)
```

E adicione sua porta.

---

## 🔧 Comandos Úteis

### Backend
```bash
# Navegar
cd backend\Arc.API

# Restaurar pacotes
dotnet restore

# Rodar migrations
dotnet ef database update

# Rodar API
dotnet run

# Rodar com hot reload
dotnet watch run

# Criar nova migration
dotnet ef migrations add NomeDaMigracao

# Ver logs
dotnet run --verbosity detailed
```

### Frontend
```bash
# Navegar
cd frontend

# Instalar dependências
npm install

# Rodar dev server
npm run dev

# Rodar em outra porta
npm run dev -- -p 3001

# Build para produção
npm run build

# Rodar produção
npm start

# Limpar cache
rm -rf .next
npm run dev
```

### Banco de Dados (PostgreSQL)
```bash
# Conectar ao PostgreSQL via terminal
psql -U postgres

# Listar databases
\l

# Conectar ao banco arc
\c arc

# Listar tabelas
\dt

# Ver dados de uma tabela
SELECT * FROM users;

# Sair
\q
```

---

## 📂 Estrutura do Projeto

```
Projectly/
├── backend/
│   ├── Arc.API/              # Controllers, Program.cs
│   ├── Arc.Application/      # Business Logic, DTOs
│   ├── Arc.Domain/           # Entities, Interfaces
│   └── Arc.Infrastructure/   # EF Core, Repositories
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js Pages (App Router)
│   │   ├── core/            # Services, Store, Types
│   │   ├── features/        # Feature modules
│   │   └── shared/          # Shared components
│   ├── public/              # Static files
│   └── package.json
│
└── README.md
```

---

## 🎯 Próximos Passos

Agora que tudo está rodando:

1. ✅ Explore o Swagger: `http://localhost:5001/swagger`
2. ✅ Crie grupos e páginas no frontend
3. ✅ Teste os templates (Kanban, Calendar, Tasks, etc.)
4. ✅ Explore o código e faça suas modificações!

---

## 💡 Dicas

- **Use 2 terminais:** Um para backend, outro para frontend
- **pgAdmin:** Use para visualizar/editar dados do banco
- **Swagger:** Teste endpoints da API facilmente
- **DevTools:** Use o console do navegador para ver erros do frontend
- **Hot Reload:** Tanto backend quanto frontend atualizam automaticamente ao salvar

---

## 📞 Ajuda

Se algo não funcionar:
1. Verifique os logs nos terminais (backend e frontend)
2. Verifique se as 3 partes estão rodando (Postgres, Backend, Frontend)
3. Verifique as portas (5432, 5001, 3000)
4. Verifique as variáveis de ambiente (`.env.local`)

---

**Feito com 💜 por [Kauan Cerqueira](https://github.com/KauanCerqueira)**
