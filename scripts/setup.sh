#!/bin/bash

# Script de setup para desenvolvimento do FinanTrack
# Configura ambiente de desenvolvimento completo

set -e

echo "🔧 Configurando ambiente de desenvolvimento do FinanTrack..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar Node.js
log_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Instale Node.js 18+ de https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

log_success "Node.js $(node -v) encontrado"

# Verificar PostgreSQL
log_info "Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    log_warning "PostgreSQL não encontrado. Instale PostgreSQL 14+ ou use Docker"
    log_info "Docker: docker run --name finantrack-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14"
else
    log_success "PostgreSQL encontrado"
fi

# Setup do Backend
log_info "Configurando backend..."
cd finantrack-api

# Instalar dependências
log_info "Instalando dependências do backend..."
npm install

# Configurar .env se não existir
if [ ! -f .env ]; then
    log_info "Criando arquivo .env do backend..."
    cat > .env << EOL
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/finantrack"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-mude-em-producao"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"

# Logs
LOG_LEVEL="debug"
EOL
    log_success "Arquivo .env criado"
else
    log_info "Arquivo .env já existe"
fi

# Executar migrations
log_info "Executando migrations do banco de dados..."
if npx prisma migrate dev --name init; then
    log_success "Migrations executadas com sucesso"
else
    log_warning "Falha nas migrations. Verifique a conexão com o banco de dados"
fi

# Gerar Prisma Client
log_info "Gerando Prisma Client..."
npx prisma generate

# Seed do banco (opcional)
if [ -f prisma/seed.ts ]; then
    log_info "Executando seed do banco de dados..."
    npm run db:seed
fi

cd ..

# Setup do Frontend
log_info "Configurando frontend..."
cd finantrack-web

# Instalar dependências
log_info "Instalando dependências do frontend..."
npm install

# Configurar .env se não existir
if [ ! -f .env ]; then
    log_info "Criando arquivo .env do frontend..."
    cat > .env << EOL
# API
REACT_APP_API_URL="http://localhost:3001/api"

# Environment
REACT_APP_ENV="development"

# Features (opcional)
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_SENTRY=false
EOL
    log_success "Arquivo .env criado"
else
    log_info "Arquivo .env já existe"
fi

cd ..

# Instalar dependências globais úteis
log_info "Verificando ferramentas de desenvolvimento..."

# Vercel CLI
if ! command -v vercel &> /dev/null; then
    log_info "Instalando Vercel CLI..."
    npm install -g vercel
fi

# Railway CLI
if ! command -v railway &> /dev/null; then
    log_info "Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Concurrently para rodar ambos os servidores
if ! npm list -g concurrently &> /dev/null; then
    log_info "Instalando concurrently..."
    npm install -g concurrently
fi

# Criar script de desenvolvimento
log_info "Criando script de desenvolvimento..."
cat > dev.sh << 'EOL'
#!/bin/bash
echo "🚀 Iniciando servidores de desenvolvimento..."
concurrently \
  --names "API,WEB" \
  --prefix-colors "blue,green" \
  "cd finantrack-api && npm run dev" \
  "cd finantrack-web && npm start"
EOL

chmod +x dev.sh

# Criar script de teste
log_info "Criando script de testes..."
cat > test.sh << 'EOL'
#!/bin/bash
echo "🧪 Executando todos os testes..."

echo "📊 Testes do Backend..."
cd finantrack-api
npm test

echo "📱 Testes do Frontend..."
cd ../finantrack-web
npm test -- --watchAll=false

echo "🔍 Validação do sistema..."
node scripts/validate-system.js

echo "✅ Todos os testes concluídos!"
EOL

chmod +x test.sh

# Resumo
echo ""
log_success "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Comandos disponíveis:"
echo "  🚀 Desenvolvimento: ./dev.sh"
echo "  🧪 Testes:         ./test.sh"
echo "  📊 Validação:      node scripts/validate-system.js"
echo ""
echo "📝 Próximos passos:"
echo "  1. Configure o banco de dados PostgreSQL"
echo "  2. Execute ./dev.sh para iniciar os servidores"
echo "  3. Acesse http://localhost:3000 para o frontend"
echo "  4. Acesse http://localhost:3001 para o backend"
echo ""
echo "📚 URLs úteis:"
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🔧 Backend:   http://localhost:3001"
echo "  📊 Prisma:    http://localhost:3001/api/docs (se configurado)"
echo ""
log_info "Ambiente configurado! 🚀"
