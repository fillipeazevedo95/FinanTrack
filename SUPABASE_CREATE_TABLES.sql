-- =====================================================
-- SCRIPT SQL COMPLETO PARA SUPABASE - FINANTRACK
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Cole este código

-- =====================================================
-- 1. CRIAR TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 2. CRIAR TABELA DE CATEGORIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 3. CRIAR TABELA DE TRANSAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 4. CRIAR TABELA DE METAS MENSAIS
-- =====================================================
CREATE TABLE IF NOT EXISTS "monthly_goals" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" DECIMAL(10,2) NOT NULL,
    "expense" DECIMAL(10,2) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_goals_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 5. CRIAR ÍNDICES ÚNICOS
-- =====================================================

-- Índice único para email de usuários
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Índice único para nome de categoria por usuário
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_userId_key" ON "categories"("name", "userId");

-- Índice único para metas mensais por usuário
CREATE UNIQUE INDEX IF NOT EXISTS "monthly_goals_month_year_userId_key" ON "monthly_goals"("month", "year", "userId");

-- =====================================================
-- 6. CRIAR CHAVES ESTRANGEIRAS (FOREIGN KEYS)
-- =====================================================

-- Relacionamento: categories -> users
ALTER TABLE "categories" 
ADD CONSTRAINT "categories_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Relacionamento: transactions -> users
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Relacionamento: transactions -> categories
ALTER TABLE "transactions" 
ADD CONSTRAINT "transactions_categoryId_fkey" 
FOREIGN KEY ("categoryId") REFERENCES "categories"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relacionamento: monthly_goals -> users
ALTER TABLE "monthly_goals" 
ADD CONSTRAINT "monthly_goals_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================
-- 7. CRIAR FUNÇÃO PARA ATUALIZAR updatedAt AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 8. CRIAR TRIGGERS PARA ATUALIZAR updatedAt
-- =====================================================

-- Trigger para tabela users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON "users" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela categories
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON "categories" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela transactions
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON "transactions" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela monthly_goals
CREATE TRIGGER update_monthly_goals_updated_at 
    BEFORE UPDATE ON "monthly_goals" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INSERIR CATEGORIAS PADRÃO (OPCIONAL)
-- =====================================================
-- Estas categorias serão criadas automaticamente para novos usuários
-- Você pode remover esta seção se não quiser categorias padrão

-- Função para criar categorias padrão para um usuário
CREATE OR REPLACE FUNCTION create_default_categories(user_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Categorias de RECEITA
    INSERT INTO "categories" ("id", "name", "description", "color", "type", "userId") VALUES
    (user_id || '_income_salary', 'Salário', 'Salário mensal', '#10B981', 'INCOME', user_id),
    (user_id || '_income_freelance', 'Freelance', 'Trabalhos extras', '#059669', 'INCOME', user_id),
    (user_id || '_income_investment', 'Investimentos', 'Rendimentos de investimentos', '#047857', 'INCOME', user_id),
    (user_id || '_income_other', 'Outras Receitas', 'Outras fontes de renda', '#065F46', 'INCOME', user_id);
    
    -- Categorias de DESPESA
    INSERT INTO "categories" ("id", "name", "description", "color", "type", "userId") VALUES
    (user_id || '_expense_food', 'Alimentação', 'Supermercado, restaurantes', '#EF4444', 'EXPENSE', user_id),
    (user_id || '_expense_transport', 'Transporte', 'Combustível, transporte público', '#F97316', 'EXPENSE', user_id),
    (user_id || '_expense_housing', 'Moradia', 'Aluguel, condomínio, IPTU', '#8B5CF6', 'EXPENSE', user_id),
    (user_id || '_expense_health', 'Saúde', 'Plano de saúde, medicamentos', '#06B6D4', 'EXPENSE', user_id),
    (user_id || '_expense_education', 'Educação', 'Cursos, livros, escola', '#3B82F6', 'EXPENSE', user_id),
    (user_id || '_expense_entertainment', 'Lazer', 'Cinema, jogos, viagens', '#EC4899', 'EXPENSE', user_id),
    (user_id || '_expense_shopping', 'Compras', 'Roupas, eletrônicos', '#F59E0B', 'EXPENSE', user_id),
    (user_id || '_expense_bills', 'Contas', 'Luz, água, internet, telefone', '#DC2626', 'EXPENSE', user_id),
    (user_id || '_expense_other', 'Outras Despesas', 'Gastos diversos', '#6B7280', 'EXPENSE', user_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. VERIFICAR SE AS TABELAS FORAM CRIADAS
-- =====================================================
-- Execute esta query para verificar se tudo foi criado corretamente
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'categories', 'transactions', 'monthly_goals')
ORDER BY table_name;

-- =====================================================
-- SCRIPT CONCLUÍDO COM SUCESSO! 🎉
-- =====================================================
-- Suas tabelas estão prontas para o FinanTrack!
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se as 4 tabelas foram criadas
-- 3. Faça o deploy da API no Render
-- 4. Teste a conexão criando um usuário
-- =====================================================
