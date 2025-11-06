# 🔐 Configuração OAuth - Google & GitHub

Este documento explica como configurar as integrações OAuth do Arc com Google Workspace e GitHub.

## 📋 Índice

1. [Google Workspace Setup](#google-workspace-setup)
2. [GitHub Setup](#github-setup)
3. [Configuração do Backend](#configuração-do-backend)
4. [Testando as Integrações](#testando-as-integrações)
5. [Troubleshooting](#troubleshooting)

---

## 🔵 Google Workspace Setup

### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Selecionar um projeto"** → **"Novo Projeto"**
3. Nome do projeto: `Arc Integration` (ou qualquer nome)
4. Clique em **"Criar"**

### 2. Ativar APIs Necessárias

Acesse: https://console.cloud.google.com/apis/library

Ative as seguintes APIs:
- ✅ **Google Calendar API**
- ✅ **Google Tasks API**
- ✅ **Google Drive API**
- ✅ **Google Docs API**
- ✅ **Google Sheets API**
- ✅ **Gmail API**
- ✅ **People API** (para contatos)

**Como ativar:**
1. Pesquise o nome da API
2. Clique na API
3. Clique em **"Ativar"**

### 3. Configurar Tela de Consentimento OAuth

1. Acesse: https://console.cloud.google.com/apis/credentials/consent
2. Escolha **"Externo"** (para testar com qualquer conta Google)
3. Clique em **"Criar"**

**Preencha os campos:**
- **Nome do app**: `Arc`
- **E-mail de suporte do usuário**: seu email
- **Domínio da página inicial do aplicativo**: `http://localhost:3000`
- **Domínios autorizados**: `localhost`
- **E-mail do desenvolvedor**: seu email

Clique em **"Salvar e continuar"**

### 4. Adicionar Escopos

Na seção **"Escopos"**, clique em **"Adicionar ou remover escopos"**

Adicione os seguintes escopos:
```
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/tasks
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/documents
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.compose
https://www.googleapis.com/auth/contacts.readonly
```

Clique em **"Salvar e continuar"**

### 5. Criar Credenciais OAuth

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique em **"Criar credenciais"** → **"ID do cliente OAuth"**
3. Tipo de aplicativo: **"Aplicativo da Web"**
4. Nome: `Arc Web Client`

**URIs de redirecionamento autorizados:**
```
http://localhost:3000/auth/callback/google
```

Para produção, adicione também:
```
https://seudominio.com/auth/callback/google
```

5. Clique em **"Criar"**

### 6. Copiar Credenciais

Uma janela popup mostrará:
- **ID do cliente**: `XXXXXXXXXXX.apps.googleusercontent.com`
- **Chave secreta do cliente**: `GOCSPX-XXXXXXXXXXXXXXXX`

**⚠️ IMPORTANTE:** Copie e guarde essas credenciais! Você precisará delas no próximo passo.

---

## 🔵 GitHub Setup

### 1. Criar OAuth App

1. Acesse: https://github.com/settings/developers
2. Clique em **"OAuth Apps"** → **"New OAuth App"**

**Preencha os campos:**
- **Application name**: `Arc Integration`
- **Homepage URL**: `http://localhost:3000`
- **Application description**: `Arc project management integration`
- **Authorization callback URL**: `http://localhost:3000/auth/callback/github`

Para produção:
- **Authorization callback URL**: `https://seudominio.com/auth/callback/github`

3. Clique em **"Register application"**

### 2. Gerar Client Secret

1. Na página do seu OAuth App, clique em **"Generate a new client secret"**
2. **⚠️ IMPORTANTE:** Copie o **Client Secret** imediatamente! Ele só será mostrado uma vez.

### 3. Copiar Client ID

Copie também o **Client ID** que aparece na página.

---

## ⚙️ Configuração do Backend

### 1. Editar appsettings.json

Abra o arquivo:
```
backend/Arc.API/appsettings.json
```

### 2. Substituir Credenciais

Cole as credenciais que você copiou:

```json
{
  "OAuth": {
    "Google": {
      "ClientId": "COLE_SEU_GOOGLE_CLIENT_ID_AQUI.apps.googleusercontent.com",
      "ClientSecret": "COLE_SUA_GOOGLE_CLIENT_SECRET_AQUI",
      "RedirectUri": "http://localhost:3000/auth/callback/google",
      "Scopes": [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/tasks",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/contacts.readonly"
      ]
    },
    "GitHub": {
      "ClientId": "COLE_SEU_GITHUB_CLIENT_ID_AQUI",
      "ClientSecret": "COLE_GITHUB_SECRET_AQUI",
      "RedirectUri": "http://localhost:3000/auth/callback/github"
    }
  }
}
```

**Exemplo preenchido:**
```json
{
  "OAuth": {
    "Google": {
      "ClientId": "123456789-abcdefghijklmnop.apps.googleusercontent.com",
      "ClientSecret": "GOCSPX-A1B2C3D4E5F6G7H8I9J0",
      "RedirectUri": "http://localhost:3000/auth/callback/google",
      "Scopes": [...]
    },
    "GitHub": {
      "ClientId": "Iv1.a1b2c3d4e5f6g7h8",
      "ClientSecret": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
      "RedirectUri": "http://localhost:3000/auth/callback/github"
    }
  }
}
```

### 3. Reiniciar Backend

```bash
cd backend/Arc.API
dotnet run
```

---

## ✅ Testando as Integrações

### 1. Iniciar Aplicação

**Backend:**
```bash
cd backend/Arc.API
dotnet run
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Testar Google Workspace

1. Abra: http://localhost:3000
2. Faça login ou registre-se
3. Acesse **"Integrations"** na sidebar (ícone de raio ⚡)
4. No card **"Google Workspace"**, clique em **"Conectar Google Workspace"**
5. Você será redirecionado para a tela de autorização do Google
6. Faça login com sua conta Google
7. Aceite as permissões solicitadas
8. Você será redirecionado de volta para o Arc

**Resultado esperado:**
- Status: ✅ Conectado
- Serviços ativos aparecem no grid
- Botão "Sincronizar" está disponível

### 3. Testar GitHub

1. No card **"GitHub"**, clique em **"Conectar GitHub"**
2. Você será redirecionado para a autorização do GitHub
3. Faça login (se necessário)
4. Clique em **"Authorize"**
5. Você será redirecionado de volta para o Arc

**Resultado esperado:**
- Status: ✅ Conectado
- Contador de repositórios aparece
- Recursos ativos aparecem no grid

### 4. Testar Sincronização

**Google:**
1. Clique em **"Sincronizar"** no card do Google
2. Aguarde alguns segundos
3. Verifique se eventos do Calendar e tasks aparecem no Arc

**GitHub:**
1. Clique em **"Configurar"**
2. Selecione um repositório padrão
3. Clique em **"Sincronizar"**
4. Issues e PRs devem aparecer como tarefas no Arc

---

## 🔧 Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa:** A URL de callback não está autorizada.

**Solução:**
1. Google: Verifique em https://console.cloud.google.com/apis/credentials
2. GitHub: Verifique em https://github.com/settings/developers
3. Certifique-se de que a URL está **exatamente** como configurada:
   - `http://localhost:3000/auth/callback/google`
   - `http://localhost:3000/auth/callback/github`

### Erro: "invalid_client"

**Causa:** Client ID ou Client Secret inválidos.

**Solução:**
1. Verifique se copiou as credenciais corretamente
2. Certifique-se de não ter espaços extras
3. No GitHub, gere um novo Client Secret se necessário

### Erro: "access_denied"

**Causa:** Usuário cancelou a autorização.

**Solução:**
- Tente conectar novamente
- Aceite todas as permissões solicitadas

### Google: "This app isn't verified"

**Causa:** App em modo de teste (externo).

**Solução:**
1. Clique em **"Advanced"**
2. Clique em **"Go to Arc (unsafe)"**
3. Aceite os riscos (é seguro em desenvolvimento)

**Para produção:**
- Envie o app para verificação do Google
- Ou configure como "Interno" (apenas para sua organização)

### Sincronização não funciona

**Verificações:**
1. Backend está rodando?
2. Token JWT está válido? (verifique localStorage)
3. Configuração foi salva? (clique em "Configurar" e verifique)
4. Console do navegador mostra erros?
5. Logs do backend mostram erros?

**Logs úteis:**
```bash
# Backend
dotnet run --verbosity detailed

# Frontend
# Abra DevTools (F12) → Console
```

---

## 🚀 Para Produção

### 1. Atualizar URLs de Callback

**Google Cloud Console:**
- Adicionar: `https://seudominio.com/auth/callback/google`

**GitHub OAuth App:**
- Atualizar: `https://seudominio.com/auth/callback/github`

### 2. Atualizar appsettings.json

```json
"OAuth": {
  "Google": {
    "RedirectUri": "https://seudominio.com/auth/callback/google"
  },
  "GitHub": {
    "RedirectUri": "https://seudominio.com/auth/callback/github"
  }
}
```

### 3. Configurar Variáveis de Ambiente

**⚠️ SEGURANÇA:** Nunca commite credenciais no código!

Use variáveis de ambiente:
```bash
export OAuth__Google__ClientId="seu-client-id"
export OAuth__Google__ClientSecret="seu-secret"
export OAuth__GitHub__ClientId="seu-client-id"
export OAuth__GitHub__ClientSecret="seu-secret"
```

Ou configure no servidor (Azure, AWS, etc.)

---

## 📚 Recursos Adicionais

### Documentação Oficial

**Google:**
- OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- APIs: https://developers.google.com/apis-explorer

**GitHub:**
- OAuth Apps: https://docs.github.com/en/apps/oauth-apps
- API: https://docs.github.com/en/rest

### Limites de API (Tier Gratuito)

**Google:**
- Calendar API: 1.000.000 requisições/dia
- Tasks API: 50.000 requisições/dia
- Drive API: 1 bilhão requisições/dia

**GitHub:**
- API REST: 5.000 requisições/hora (autenticado)
- API GraphQL: 5.000 pontos/hora

---

## ✅ Checklist de Configuração

### Google Workspace
- [ ] Projeto criado no Google Cloud Console
- [ ] APIs ativadas (Calendar, Tasks, Drive, etc.)
- [ ] Tela de consentimento configurada
- [ ] Escopos adicionados
- [ ] Credenciais OAuth criadas
- [ ] Client ID copiado
- [ ] Client Secret copiado
- [ ] URLs de callback configuradas
- [ ] Credenciais adicionadas ao appsettings.json

### GitHub
- [ ] OAuth App criado
- [ ] Homepage URL configurada
- [ ] Callback URL configurada
- [ ] Client Secret gerado
- [ ] Client ID copiado
- [ ] Client Secret copiado
- [ ] Credenciais adicionadas ao appsettings.json

### Teste
- [ ] Backend rodando
- [ ] Frontend rodando
- [ ] Google OAuth funcionando
- [ ] GitHub OAuth funcionando
- [ ] Sincronização do Google testada
- [ ] Sincronização do GitHub testada

---

## 🎉 Pronto!

Suas integrações estão configuradas! Agora você pode:
- ✅ Fazer login com Google ou GitHub
- ✅ Sincronizar Calendar e Tasks do Google
- ✅ Sincronizar Issues e PRs do GitHub
- ✅ Criar tarefas automaticamente
- ✅ Visualizar tudo em um só lugar

**Dúvidas?** Abra uma issue no repositório!
