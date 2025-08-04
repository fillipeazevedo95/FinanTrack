# 🚀 SEU DEPLOY PERSONALIZADO - FinanTrack

## ✅ **TUDO PRONTO! Agora é só seguir estes passos:**

### 🎯 **Suas Configurações (Já Prontas):**
- **Banco:** Supabase PostgreSQL configurado
- **Project ID:** `jhgehkehbclzkzrxehmg`
- **Senha:** `[@Fillipe95@]`
- **Código:** Enviado para GitHub ✅

---

## 📋 **PASSO 1: Deploy do Backend (15 min)**

### **1.1 Acessar Render:**
1. **Vá para:** https://render.com
2. **Clique em:** "Get Started for Free"
3. **Faça login** com GitHub
4. **Autorize** o acesso aos repositórios

### **1.2 Criar Web Service:**
1. **Clique em:** "New +"
2. **Selecione:** "Web Service"
3. **Procure por:** "FinanTrack" (seu repositório)
4. **Clique em:** "Connect"

### **1.3 Configurar Serviço:**
**Configurações básicas:**
- **Name:** `finantrack-api`
- **Root Directory:** `finantrack-api`
- **Environment:** `Node`
- **Region:** `Oregon (US West)`
- **Branch:** `main`

**Build & Deploy:**
- **Build Command:** 
```
npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

- **Start Command:**
```
npm start
```

### **1.4 Variáveis de Ambiente:**
**Clique em "Advanced" e adicione EXATAMENTE estas variáveis:**

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres:[@Fillipe95@]@db.jhgehkehbclzkzrxehmg.supabase.co:5432/postgres` |
| `JWT_SECRET` | `finantrack_jwt_secret_2024_super_seguro_mude_em_producao_real` |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `*` |

### **1.5 Finalizar:**
1. **Clique em:** "Create Web Service"
2. **Aguarde:** 5-10 minutos (acompanhe os logs)
3. **Anote a URL:** Algo como `https://finantrack-api.onrender.com`

---

## 📋 **PASSO 2: Deploy do Frontend (10 min)**

### **2.1 Criar Static Site:**
1. **No Render, clique:** "New +"
2. **Selecione:** "Static Site"
3. **Conecte o mesmo repositório**
4. **Clique:** "Connect"

### **2.2 Configurar Static Site:**
**Configurações básicas:**
- **Name:** `finantrack-web`
- **Root Directory:** `finantrack-web`
- **Branch:** `main`

**Build Settings:**
- **Build Command:**
```
npm install && npm run build
```

- **Publish Directory:**
```
build
```

### **2.3 Variáveis de Ambiente:**
**Adicione estas variáveis (substitua pela URL real do seu backend):**

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://finantrack-api.onrender.com` |
| `NODE_ENV` | `production` |
| `REACT_APP_APP_NAME` | `FinanTrack` |

### **2.4 Finalizar:**
1. **Clique em:** "Create Static Site"
2. **Aguarde:** 5-10 minutos
3. **Anote a URL:** Algo como `https://finantrack-web.onrender.com`

---

## 📋 **PASSO 3: Conectar Frontend e Backend (5 min)**

### **3.1 Atualizar CORS:**
1. **Volte ao serviço do backend**
2. **Vá em:** Environment
3. **Edite a variável:** `FRONTEND_URL`
4. **Novo valor:** `https://finantrack-web.onrender.com` (sua URL real)
5. **Salve** - Redeploy automático

---

## 📋 **PASSO 4: Verificar no Supabase (2 min)**

### **4.1 Verificar Tabelas:**
1. **Acesse:** https://app.supabase.com
2. **Clique no projeto:** FinanTrack
3. **Vá em:** Table Editor
4. **Deve ver as tabelas:**
   - `users`
   - `categories` 
   - `transactions`
   - `monthly_goals`

### **4.2 Se não aparecerem:**
1. Verifique os logs do deploy no Render
2. Confirme que a migration rodou com sucesso
3. A string de conexão está correta

---

## 📋 **PASSO 5: Testes Finais (5 min)**

### **5.1 Teste Backend:**
```bash
curl https://finantrack-api.onrender.com/health
```
**Resposta esperada:** `{"status":"OK",...}`

### **5.2 Teste Frontend:**
1. **Acesse:** `https://finantrack-web.onrender.com`
2. **Verifique:** Se carrega sem erros
3. **Teste:** Criar conta
4. **Teste:** Fazer login
5. **Teste:** Criar transação

### **5.3 Verificar Dados:**
1. **No Supabase, vá em:** Table Editor → users
2. **Deve aparecer** o usuário que você criou
3. **Vá em:** transactions
4. **Deve aparecer** as transações criadas

---

## 🎉 **PRONTO! Seu FinanTrack está no ar!**

### **🔗 Suas URLs finais:**
- **Frontend:** `https://finantrack-web.onrender.com`
- **Backend:** `https://finantrack-api.onrender.com`
- **Supabase:** `https://app.supabase.com/project/jhgehkehbclzkzrxehmg`

### **📊 Funcionalidades disponíveis:**
- ✅ Sistema de autenticação
- ✅ Gestão de receitas e despesas
- ✅ Categorias personalizadas
- ✅ Relatórios e gráficos
- ✅ Metas mensais
- ✅ Dados persistentes no PostgreSQL

---

## 🆘 **Se algo der errado:**

### **❌ Build Failed:**
1. Verifique os logs no Render
2. Confirme que as variáveis estão corretas
3. Teste localmente: `npm run build`

### **❌ Database Error:**
1. Verifique a string de conexão
2. Confirme que o Supabase está ativo
3. Execute migration manual se necessário

### **❌ CORS Error:**
1. Confirme que `FRONTEND_URL` está correto
2. Aguarde o redeploy do backend
3. Teste em aba anônima

---

## ⏱️ **Tempo Total Estimado: 35 minutos**
## 💰 **Custo Total: R$ 0,00 (100% GRATUITO)**

**🚀 Vamos colocar seu FinanTrack no ar!**
