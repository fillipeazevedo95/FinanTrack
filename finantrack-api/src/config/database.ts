import { PrismaClient } from '@prisma/client';

// Configuração global do Prisma Client
declare global {
  var __prisma: PrismaClient | undefined;
}

// Criar instância do Prisma Client
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Em desenvolvimento, usar a instância global para evitar múltiplas conexões
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Função para conectar ao banco
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
};

// Função para desconectar do banco
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
};

// Tratamento de sinais para fechar conexão graciosamente
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default prisma;
