# 🔗 Exemplo de Configuração - Supabase

## 📋 **Dados do Projeto (Exemplo)**

Após criar seu projeto no Supabase, você receberá informações similares a estas:

### **🏷️ Informações do Projeto:**
- **Project Name:** FinanTrack
- **Project ID:** abcdefghijklmnop
- **Database Password:** FinanTrack2024!
- **Region:** South America (São Paulo)

### **🔗 String de Conexão Completa:**
```
postgresql://postgres:FinanTrack2024!@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### **🔧 Como Usar:**

#### **1. No arquivo `.env.production`:**
```env
DATABASE_URL="postgresql://postgres:FinanTrack2024!@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

#### **2. No Render (Environment Variables):**
```
Key: DATABASE_URL
Value: postgresql://postgres:FinanTrack2024!@db.abcdefghijklmnop.supabase.co:5432/postgres
```

#### **3. No arquivo `render.yaml`:**
```yaml
envVars:
  - key: DATABASE_URL
    value: postgresql://postgres:FinanTrack2024!@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 🔍 **Como Encontrar Suas Informações:**

### **📍 Passo 1: Dashboard do Supabase**
1. Acesse: https://app.supabase.com
2. Clique no seu projeto `FinanTrack`

### **📍 Passo 2: Obter Project Reference**
1. Na URL do dashboard, você verá algo como:
   ```
   https://app.supabase.com/project/abcdefghijklmnop
   ```
2. O `abcdefghijklmnop` é seu **Project Reference**

### **📍 Passo 3: Obter String de Conexão**
1. Vá em: **Settings** → **Database**
2. Na seção **Connection string**, copie a URI
3. Substitua `[YOUR-PASSWORD]` pela sua senha

---

## ⚠️ **Importante:**

### **🔒 Segurança:**
- **NUNCA** commite a string de conexão no Git
- Use sempre variáveis de ambiente
- A senha deve ser forte e única

### **🌍 Região:**
- Escolha **South America (São Paulo)** para menor latência no Brasil
- Outras opções: US East, Europe West, etc.

### **💾 Backup:**
- O Supabase faz backup automático
- Dados são replicados automaticamente
- Muito mais seguro que SQLite local

---

## 🧪 **Teste de Conexão:**

### **🔧 Usando psql (se tiver instalado):**
```bash
psql "postgresql://postgres:FinanTrack2024!@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### **🔧 Usando Prisma:**
```bash
npx prisma db push
npx prisma studio
```

### **🔧 Via API:**
```bash
curl -X POST https://finantrack-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@exemplo.com", 
    "password": "123456"
  }'
```

---

## 📊 **Monitoramento:**

### **📈 No Dashboard do Supabase:**
- **Database:** Uso de espaço e conexões
- **API:** Requisições em tempo real
- **Logs:** Queries e erros
- **Performance:** Métricas de performance

### **📊 Limites do Plano Gratuito:**
- **Storage:** 500MB
- **Database size:** 500MB
- **Bandwidth:** 5GB/mês
- **API requests:** 50,000/mês
- **Realtime connections:** 200 simultâneas
- **Edge Function invocations:** 500,000/mês

---

## 🎯 **Próximos Passos:**

1. **Substitua** `abcdefghijklmnop` pelo seu Project Reference real
2. **Confirme** que a senha está correta
3. **Teste** a conexão localmente
4. **Configure** no Render
5. **Execute** as migrations
6. **Verifique** as tabelas no Supabase

**🚀 Seu banco PostgreSQL estará pronto para produção!**
