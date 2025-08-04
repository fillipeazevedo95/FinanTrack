# ✅ Checklist de Deploy - FinanTrack

## 🚀 PASSO A PASSO RÁPIDO

### 1️⃣ Preparação (5 min)
- [ ] Código sem erros TypeScript (`npm run type-check`)
- [ ] Build local funcionando (`npm run build`)
- [ ] Arquivos `.env.production` criados
- [ ] Commit e push no GitHub

### 1️⃣.5 Configuração do Banco (10 min)
- [ ] Conta criada no Supabase (https://supabase.com)
- [ ] Projeto criado com nome `FinanTrack`
- [ ] Senha anotada: `FinanTrack2024!`
- [ ] String de conexão copiada
- [ ] Schema.prisma atualizado para PostgreSQL

### 2️⃣ Deploy Backend (15 min)
- [ ] Conta criada no Render.com
- [ ] Repositório conectado
- [ ] Web Service criado com nome `finantrack-api`
- [ ] Root Directory: `finantrack-api`
- [ ] Build Command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
- [ ] Start Command: `npm start`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=postgresql://postgres:FinanTrack2024!@db.SEU-PROJECT-REF.supabase.co:5432/postgres`
  - [ ] `JWT_SECRET=finantrack_jwt_secret_2024_super_seguro_mude_em_producao_real`
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `FRONTEND_URL=*`
- [ ] Deploy concluído com sucesso
- [ ] Health check funcionando: `https://finantrack-api.onrender.com/health`

### 3️⃣ Deploy Frontend (10 min)
- [ ] Static Site criado no Render
- [ ] Nome: `finantrack-web`
- [ ] Root Directory: `finantrack-web`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `build`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `REACT_APP_API_URL=https://finantrack-api.onrender.com`
  - [ ] `NODE_ENV=production`
  - [ ] `REACT_APP_APP_NAME=FinanTrack`
- [ ] Deploy concluído com sucesso
- [ ] Site carregando: `https://finantrack-web.onrender.com`

### 4️⃣ Configuração Final (5 min)
- [ ] Atualizar `FRONTEND_URL` no backend para URL real do frontend
- [ ] Redeploy automático do backend
- [ ] Teste de integração frontend + backend

### 5️⃣ Testes (5 min)
- [ ] Página inicial carrega
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Criação de transação funciona
- [ ] Dados persistem após refresh
- [ ] Tabelas visíveis no Supabase (Table Editor)

## 🎯 URLs FINAIS

Após completar o checklist:
- **Frontend:** `https://finantrack-web.onrender.com`
- **Backend:** `https://finantrack-api.onrender.com`
- **API Health:** `https://finantrack-api.onrender.com/health`

## 🆘 PROBLEMAS COMUNS

### Build Failed?
1. Execute `npm run type-check` localmente
2. Verifique logs no Render
3. Confirme que package.json tem scripts corretos

### App não carrega?
1. Verifique variáveis de ambiente
2. Confirme URLs estão corretas
3. Aguarde 1-2 minutos (primeiro deploy é mais lento)

### CORS Error?
1. Verifique `FRONTEND_URL` no backend
2. Confirme `REACT_APP_API_URL` no frontend
3. Aguarde redeploy automático

## ⏱️ TEMPO TOTAL: ~40 MINUTOS
## 💰 CUSTO TOTAL: R$ 0,00 (GRATUITO)
