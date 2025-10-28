# ⚡ Quick Start - Arc. Local

## 📝 Checklist Rápida

### Antes de começar (apenas 1x):

- [ ] **PostgreSQL instalado** → https://www.postgresql.org/download/windows/
  - Usuário: `postgres`
  - Senha: Anote sua senha!
  - Porta: `5432`

- [ ] **.NET 8 SDK instalado** → https://dotnet.microsoft.com/download/dotnet/8.0
  - Teste: `dotnet --version` deve mostrar `8.0.x`

- [ ] **Node.js instalado** → https://nodejs.org/
  - Teste: `node --version` deve mostrar `v20.x` ou superior

---

## 🚀 Iniciar Projeto (3 comandos)

### Opção 1: Modo Automático (Windows)

1. **Setup do banco (apenas 1x):**
   ```bash
   setup-database.bat
   ```

2. **Iniciar tudo:**
   ```bash
   start-local.bat
   ```

3. **Acessar:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Swagger: http://localhost:5001/swagger

4. **Parar tudo:**
   ```bash
   stop-local.bat
   ```

---

### Opção 2: Modo Manual

#### Terminal 1 - Backend:
```bash
cd backend\Arc.API
dotnet ef database update    # Apenas 1x
dotnet run
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm install                  # Apenas 1x
npm run dev
```

---

## ⚙️ Configuração Necessária

### 1. Banco de Dados

**Arquivo:** `backend\Arc.API\appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=arc;Username=postgres;Password=SUA_SENHA_AQUI"
  }
}
```

⚠️ **ATENÇÃO:** Troque `SUA_SENHA_AQUI` pela senha do seu PostgreSQL!

### 2. Frontend

**Arquivo:** `frontend\.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME=Arc.
```

✅ **Já está configurado!**

---

## ✅ Verificação

Após iniciar tudo, verifique:

- [ ] PostgreSQL rodando (porta 5432)
- [ ] Backend rodando → `http://localhost:5001/swagger` abre?
- [ ] Frontend rodando → `http://localhost:3000` abre?

---

## 🐛 Problemas Comuns

### "Could not connect to database"
→ Verifique a senha no `appsettings.json`
→ PostgreSQL está rodando?

### "Port already in use"
```bash
# Backend (porta 5001)
netstat -ano | findstr :5001
taskkill /PID [número] /F

# Frontend (porta 3000)
netstat -ano | findstr :3000
taskkill /PID [número] /F
```

### "dotnet ef not found"
```bash
dotnet tool install --global dotnet-ef
```

---

## 📚 Documentação Completa

Para mais detalhes, veja: [SETUP_LOCAL.md](SETUP_LOCAL.md)

---

## 🎯 Primeira Vez?

1. Execute `setup-database.bat` (cria o banco)
2. Execute `start-local.bat` (inicia tudo)
3. Acesse `http://localhost:3000`
4. Crie sua conta
5. Comece a usar! 🎉
