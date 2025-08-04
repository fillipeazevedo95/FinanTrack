# 🗄️ Configuração do Banco de Dados - Supabase

## 🎯 **Por que Supabase?**
- ✅ **PostgreSQL gratuito** (500MB)
- ✅ **Backup automático**
- ✅ **Interface web** para gerenciar dados
- ✅ **API REST automática**
- ✅ **Mais confiável** que SQLite em produção
- ✅ **Hospedado na AWS**

---

## 📋 **PASSO 1: Criar Conta no Supabase**

1. **Acesse:** https://supabase.com
2. **Clique em:** "Start your project"
3. **Faça login** com GitHub
4. **Autorize** o acesso

---

## 📋 **PASSO 2: Criar Projeto**

1. **Clique em:** "New Project"
2. **Preencha:**
   - **Name:** `FinanTrack`
   - **Database Password:** `FinanTrack2024!` (⚠️ **ANOTE ESTA SENHA!**)
   - **Region:** `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan:** `Free`
3. **Clique em:** "Create new project"
4. **Aguarde:** 2-3 minutos para provisionar

---

## 📋 **PASSO 3: Obter String de Conexão**

1. **No dashboard do projeto, vá em:** Settings → Database
2. **Na seção "Connection string", copie a URI:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

3. **Substitua `[YOUR-PASSWORD]`** pela senha que você criou (`FinanTrack2024!`)
4. **Anote o PROJECT-REF** (será algo como `abcdefghijklmnop`)

**Exemplo da string final:**
```
postgresql://postgres:FinanTrack2024!@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 📋 **PASSO 4: Configurar Variáveis de Ambiente**

### 🔧 **Para Deploy no Render:**

1. **Vá no seu serviço backend no Render**
2. **Clique em:** Environment
3. **Edite a variável:** `DATABASE_URL`
4. **Cole sua string de conexão do Supabase:**
```
postgresql://postgres:FinanTrack2024!@db.SEU-PROJECT-REF.supabase.co:5432/postgres
```
5. **Salve** - O redeploy será automático

### 🔧 **Para Desenvolvimento Local:**

Atualize o arquivo `finantrack-api/.env`:
```env
DATABASE_URL="postgresql://postgres:FinanTrack2024!@db.SEU-PROJECT-REF.supabase.co:5432/postgres"
```

---

## 📋 **PASSO 5: Executar Migrations**

### 🚀 **Automático (no Deploy):**
O Render executará automaticamente:
```bash
npx prisma migrate deploy
```

### 🛠️ **Manual (se necessário):**
Se precisar executar localmente:
```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 📋 **PASSO 6: Verificar no Supabase**

1. **No dashboard do Supabase, vá em:** Table Editor
2. **Você deve ver as tabelas:**
   - `users`
   - `categories`
   - `transactions`
   - `monthly_goals`

3. **Se as tabelas não aparecerem:**
   - Verifique os logs do deploy no Render
   - Confirme que a string de conexão está correta
   - Execute as migrations manualmente

---

## 🔍 **PASSO 7: Testar Conexão**

### 🧪 **Teste 1: Health Check**
```bash
curl https://finantrack-api.onrender.com/health
```

### 🧪 **Teste 2: Criar Usuário**
```bash
curl -X POST https://finantrack-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@exemplo.com",
    "password": "123456"
  }'
```

### 🧪 **Teste 3: Verificar no Supabase**
1. **Vá em:** Table Editor → users
2. **Deve aparecer** o usuário criado

---

## 🛡️ **PASSO 8: Configurar Segurança (Opcional)**

### 🔒 **Row Level Security (RLS):**
1. **No Supabase, vá em:** Authentication → Policies
2. **Para cada tabela, crie políticas:**

**Exemplo para tabela `transactions`:**
```sql
-- Política de SELECT
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (auth.uid()::text = userId);

-- Política de INSERT
CREATE POLICY "Users can insert own transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid()::text = userId);

-- Política de UPDATE
CREATE POLICY "Users can update own transactions" ON transactions
FOR UPDATE USING (auth.uid()::text = userId);

-- Política de DELETE
CREATE POLICY "Users can delete own transactions" ON transactions
FOR DELETE USING (auth.uid()::text = userId);
```

---

## 📊 **PASSO 9: Monitoramento**

### 📈 **Dashboard do Supabase:**
- **Database:** Monitore uso de espaço
- **API:** Veja requisições em tempo real
- **Logs:** Acompanhe erros e queries

### 📊 **Limites do Plano Gratuito:**
- **Armazenamento:** 500MB
- **Bandwidth:** 5GB/mês
- **Requisições:** 50.000/mês
- **Conexões simultâneas:** 60

---

## 🔧 **Solução de Problemas**

### ❌ **Erro: "Connection refused"**
**Soluções:**
1. Verifique se a string de conexão está correta
2. Confirme que a senha não tem caracteres especiais problemáticos
3. Teste a conexão diretamente no Supabase

### ❌ **Erro: "Migration failed"**
**Soluções:**
1. Verifique se o banco está vazio
2. Execute `npx prisma db push` em vez de migrate
3. Recrie o projeto no Supabase se necessário

### ❌ **Erro: "Too many connections"**
**Soluções:**
1. Configure connection pooling no Prisma
2. Use `?pgbouncer=true` na string de conexão
3. Monitore conexões ativas no Supabase

### ❌ **Erro: "SSL required"**
**Soluções:**
1. Adicione `?sslmode=require` na string de conexão:
```
postgresql://postgres:senha@db.ref.supabase.co:5432/postgres?sslmode=require
```

---

## 🎯 **Checklist Final**

- [ ] Conta criada no Supabase
- [ ] Projeto criado com senha anotada
- [ ] String de conexão obtida
- [ ] Variável `DATABASE_URL` atualizada no Render
- [ ] Schema.prisma atualizado para PostgreSQL
- [ ] Migrations executadas com sucesso
- [ ] Tabelas visíveis no Supabase
- [ ] Testes de conexão passando
- [ ] Usuário de teste criado
- [ ] Dados persistindo corretamente

---

## 🚀 **Próximos Passos**

1. **Faça o deploy** com as novas configurações
2. **Teste todas as funcionalidades** do app
3. **Configure backup** (automático no Supabase)
4. **Monitore performance** no dashboard
5. **Configure alertas** para limites do plano gratuito

**🎉 Seu banco PostgreSQL está pronto para produção!**

---

## 📞 **Links Úteis**

- **Supabase Dashboard:** https://app.supabase.com
- **Documentação:** https://supabase.com/docs
- **Prisma + Supabase:** https://supabase.com/docs/guides/integrations/prisma
- **Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

**💰 Custo:** R$ 0,00 (100% gratuito até 500MB)
