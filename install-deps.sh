#!/bin/bash

# Script para instalar todas as dependências do projeto FinanTrack

echo "🔧 Instalando dependências do FinanTrack..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Instalando dependências do Backend...${NC}"
cd finantrack-api
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend installation had issues${NC}"
fi

cd ..

echo -e "${BLUE}📦 Instalando dependências do Frontend...${NC}"
cd finantrack-web
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend installation had issues${NC}"
fi

cd ..

echo -e "${GREEN}🎉 Instalação concluída!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o banco de dados PostgreSQL"
echo "2. Configure os arquivos .env"
echo "3. Execute as migrations: cd finantrack-api && npm run db:migrate"
echo "4. Inicie os servidores: ./dev.sh (se disponível)"
echo ""
echo "🧪 Para executar testes:"
echo "Backend:  cd finantrack-api && npm test"
echo "Frontend: cd finantrack-web && npm test"
