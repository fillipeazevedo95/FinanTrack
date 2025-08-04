#!/bin/bash

# Script de deploy para FinanTrack
# Executa deploy do frontend (Vercel) e backend (Railway)

set -e

echo "🚀 Iniciando deploy do FinanTrack..."

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

# Verificar se as CLIs estão instaladas
check_cli() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 CLI não encontrada. Instale com: npm i -g $2"
        exit 1
    fi
}

# Verificar dependências
log_info "Verificando dependências..."
check_cli "vercel" "@vercel/cli"
check_cli "railway" "@railway/cli"

# Verificar se está logado
log_info "Verificando autenticação..."

if ! vercel whoami &> /dev/null; then
    log_warning "Não está logado no Vercel. Execute: vercel login"
    exit 1
fi

if ! railway whoami &> /dev/null; then
    log_warning "Não está logado no Railway. Execute: railway login"
    exit 1
fi

# Deploy do Backend (Railway)
log_info "Iniciando deploy do backend..."
cd finantrack-api

# Verificar se o projeto Railway existe
if ! railway status &> /dev/null; then
    log_warning "Projeto Railway não encontrado. Criando..."
    railway init
fi

# Deploy do backend
log_info "Fazendo deploy do backend no Railway..."
railway up --detach

if [ $? -eq 0 ]; then
    log_success "Backend deployado com sucesso!"
else
    log_error "Falha no deploy do backend"
    exit 1
fi

# Obter URL do backend
BACKEND_URL=$(railway domain)
if [ -z "$BACKEND_URL" ]; then
    log_warning "URL do backend não encontrada. Configure um domínio no Railway."
    BACKEND_URL="https://seu-projeto.railway.app"
fi

log_info "URL do backend: $BACKEND_URL"

cd ..

# Deploy do Frontend (Vercel)
log_info "Iniciando deploy do frontend..."
cd finantrack-web

# Configurar variável de ambiente
log_info "Configurando variáveis de ambiente..."
vercel env add REACT_APP_API_URL production <<< "$BACKEND_URL/api"

# Deploy do frontend
log_info "Fazendo deploy do frontend no Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    log_success "Frontend deployado com sucesso!"
else
    log_error "Falha no deploy do frontend"
    exit 1
fi

# Obter URL do frontend
FRONTEND_URL=$(vercel ls --scope=team | grep finantrack-web | awk '{print $2}' | head -1)
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="https://finantrack-web.vercel.app"
fi

log_info "URL do frontend: $FRONTEND_URL"

cd ..

# Configurar CORS no backend
log_info "Configurando CORS no backend..."
cd finantrack-api
railway variables set FRONTEND_URL="$FRONTEND_URL"
cd ..

# Resumo do deploy
echo ""
log_success "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Resumo:"
echo "  🌐 Frontend: $FRONTEND_URL"
echo "  🔧 Backend:  $BACKEND_URL"
echo ""
echo "📝 Próximos passos:"
echo "  1. Teste a aplicação nos URLs acima"
echo "  2. Configure domínio personalizado (opcional)"
echo "  3. Configure SSL/HTTPS (se necessário)"
echo "  4. Configure monitoramento e logs"
echo ""
log_info "Deploy finalizado! 🚀"
