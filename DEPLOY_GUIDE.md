# 🚀 **Guia Completo de Deploy - FinanTrack

## 📋 Índice
1. [Preparação do Projeto](#preparação-do-projeto)
2. [Configuração do Banco de Dados (Supabase)](#configuração-do-banco-de-dados-supabase)
3. [Configuração do Backend (API)](#configuração-do-backend-api)
4. [Deploy do Backend no Render](#deploy-do-backend-no-render)
5. [Configuração do Frontend](#configuração-do-frontend)
6. [Deploy do Frontend no Render](#deploy-do-frontend-no-render)
7. [Configuração de Domínio](#configuração-de-domínio)
8. [Testes Pós-Deploy](#testes-pós-deploy)
9. [Solução de Problemas](#solução-de-problemas)**

Este guia fornece instruções passo a passo para fazer deploy do projeto FinanTrack em produção, com frontend no Vercel e backend no Railway ou Supabase.

## 📋 **Pré-requisitos**

- ✅ Conta no [GitHub](https://github.com)
- ✅ Conta no [Vercel](https://vercel.com)
- ✅ Conta no [Railway](https://railway.app) OU [Supabase](https://supabase.com)
- ✅ Node.js 18+ instalado localmente
- ✅ Git configurado

---

## 🎯 **Opção 1: Deploy com Railway (Recomendado)**

### **Passo 1: Preparar o Repositório**

1. **Fazer push do código para o GitHub:**
```bash
git add .
git commit -m "feat: projeto pronto para deploy"
git push origin main
```

2. **Verificar estrutura do projeto:**
```
finantrack/
├── finantrack-web/     # Frontend React
├── finantrack-api/     # Backend Node.js
├── README.md
└── DEPLOY_GUIDE.md
```

### **Passo 2: Deploy do Backend no Railway**

1. **Acessar Railway:**
   - Vá para [railway.app](https://railway.app)
   - Faça login com GitHub
   - Clique em "New Project"

2. **Conectar repositório:**
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório `finantrack`
   - Selecione a pasta `finantrack-api`

3. **Configurar variáveis de ambiente:**
   - No dashboard do Railway, vá em "Variables"
   - Adicione as seguintes variáveis:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=seu_jwt_secret_super_seguro_aqui
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```

4. **Configurar banco de dados:**
   - No Railway, clique em "Add Service"
   - Selecione "PostgreSQL"
   - Copie a `DATABASE_URL` gerada
   - Cole na variável de ambiente `DATABASE_URL`

5. **Deploy automático:**
   - O Railway fará deploy automaticamente
   - Anote a URL do backend: `https://seu-backend.railway.app`

### **Passo 3: Deploy do Frontend no Vercel**

1. **Acessar Vercel:**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login com GitHub
   - Clique em "New Project"

2. **Importar projeto:**
   - Selecione o repositório `finantrack`
   - Configure o Root Directory: `finantrack-web`
   - Framework Preset: `Create React App`

3. **Configurar variáveis de ambiente:**
   - Em "Environment Variables", adicione:
   ```env
   REACT_APP_API_URL=https://seu-backend.railway.app
   REACT_APP_ENV=production
   ```

4. **Configurar build:**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Anote a URL: `https://seu-frontend.vercel.app`

### **Passo 4: Configurar CORS no Backend**

1. **Atualizar variável CORS_ORIGIN no Railway:**
```env
CORS_ORIGIN=https://seu-frontend.vercel.app
```

2. **Verificar arquivo `finantrack-api/src/app.ts`:**
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

---

## 🎯 **Opção 2: Deploy com Supabase**

### **Passo 1: Configurar Supabase**

1. **Criar projeto no Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Clique em "New Project"
   - Escolha nome, senha e região

2. **Obter credenciais:**
   - Vá em "Settings" > "Database"
   - Copie a "Connection string"
   - Vá em "Settings" > "API"
   - Copie a "URL" e "anon public key"

### **Passo 2: Deploy do Backend no Railway**

1. **Seguir passos 1-2 da Opção 1**

2. **Configurar variáveis com Supabase:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres
SUPABASE_URL=https://projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
CORS_ORIGIN=https://seu-frontend.vercel.app
```

### **Passo 3: Deploy do Frontend (igual Opção 1)**

---

## 🔧 **Configurações Adicionais**

### **Configurar Domínio Personalizado (Opcional)**

1. **No Vercel:**
   - Vá em "Settings" > "Domains"
   - Adicione seu domínio personalizado
   - Configure DNS conforme instruções

2. **No Railway:**
   - Vá em "Settings" > "Domains"
   - Adicione domínio personalizado para API

### **Configurar HTTPS e Segurança**

1. **Headers de segurança no backend:**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

2. **Configurar rate limiting:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});

app.use('/api/', limiter);
```

---

## 📊 **Monitoramento e Logs**

### **Railway:**
- Logs em tempo real no dashboard
- Métricas de CPU e memória
- Alertas automáticos

### **Vercel:**
- Analytics integrado
- Core Web Vitals
- Function logs

### **Supabase:**
- Dashboard com métricas
- Logs de queries
- Monitoramento de performance

---

## 🔄 **CI/CD Automático**

### **GitHub Actions (Opcional)**

Criar `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Deploy automático já configurado no Vercel/Railway
      - name: Deploy notification
        run: echo "Deploy iniciado automaticamente"
```

---

## ✅ **Checklist Final**

- [ ] Backend deployado no Railway/Supabase
- [ ] Frontend deployado no Vercel
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente definidas
- [ ] CORS configurado corretamente
- [ ] HTTPS funcionando
- [ ] Domínio personalizado (opcional)
- [ ] Monitoramento ativo

---

## 🆘 **Troubleshooting**

### **Problemas Comuns:**

1. **CORS Error:**
   - Verificar `CORS_ORIGIN` no backend
   - Confirmar URL do frontend

2. **Database Connection Error:**
   - Verificar `DATABASE_URL`
   - Testar conexão local primeiro

3. **Build Error no Vercel:**
   - Verificar `package.json`
   - Limpar cache: `npm run build` local

4. **API não responde:**
   - Verificar logs no Railway
   - Confirmar variáveis de ambiente

### **Comandos Úteis:**

```bash
# Testar build local
cd finantrack-web && npm run build

# Testar backend local
cd finantrack-api && npm run dev

# Verificar logs
railway logs
vercel logs
```

---

## 🎉 **Projeto Online!**

Após seguir este guia, seu FinanTrack estará online e acessível em:
- **Frontend:** `https://seu-projeto.vercel.app`
- **Backend:** `https://seu-backend.railway.app`

**Funcionalidades disponíveis:**
- ✅ Sistema de autenticação
- ✅ Gestão de receitas e despesas
- ✅ Relatórios e gráficos
- ✅ Interface responsiva
- ✅ Dados persistentes
- ✅ Deploy automático

**🚀 Parabéns! Seu sistema financeiro está no ar!**

---

## 🔧 Solução de Problemas Comuns

### ❌ Problema 1: "Build Failed"
**Sintomas:** Deploy falha durante o build
**Soluções:**
1. Verifique erros TypeScript: `npm run type-check`
2. Teste build local: `npm run build`
3. Verifique logs no Render para erros específicos

### ❌ Problema 2: "Application Error"
**Sintomas:** App não inicia após deploy
**Soluções:**
1. Verifique variáveis de ambiente
2. Confirme que PORT está correto
3. Verifique logs do servidor no Render

### ❌ Problema 3: "CORS Error"
**Sintomas:** Frontend não consegue acessar API
**Soluções:**
1. Verifique variável `FRONTEND_URL` no backend
2. Confirme que `REACT_APP_API_URL` está correto
3. Teste CORS com curl

### ❌ Problema 4: "Database Error"
**Sintomas:** Erros relacionados ao banco
**Soluções:**
1. Verifique se `prisma generate` rodou no build
2. Confirme que `DATABASE_URL` está correto
3. Execute `npx prisma db push` manualmente

---

## 📋 COMANDOS PRONTOS PARA USAR

### 🔨 Build Commands (Backend):
```bash
npm install && npm run build && npx prisma generate && npx prisma db push
```

### ▶️ Start Command (Backend):
```bash
npm start
```

### 🔨 Build Command (Frontend):
```bash
npm install && npm run build
```

### 📁 Publish Directory (Frontend):
```bash
build
```

### 🩺 Teste Health Check:
```bash
curl https://finantrack-api.onrender.com/health
```

### ⚙️ Variáveis de Ambiente (Backend):
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:FinanTrack2024!@db.SEU-PROJECT-REF.supabase.co:5432/postgres
JWT_SECRET=finantrack_jwt_secret_2024_super_seguro_mude_em_producao_real
JWT_EXPIRES_IN=7d
FRONTEND_URL=*
```

### ⚙️ Variáveis de Ambiente (Frontend):
```
REACT_APP_API_URL=https://finantrack-api.onrender.com
NODE_ENV=production
REACT_APP_APP_NAME=FinanTrack
```

---

## ⏱️ Resumo Final

- **Tempo estimado:** 30-60 minutos
- **Custo:** 100% GRATUITO 💰
- **Plataforma:** Render.com (mais confiável)
- **Banco de dados:** SQLite (simples e eficiente)
- **Deploy:** Automático via GitHub

**🎉 Seu FinanTrack está pronto para o mundo!**
