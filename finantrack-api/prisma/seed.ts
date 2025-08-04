import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.monthlyGoal.deleteMany();
    await prisma.user.deleteMany();
  }

  // Criar usuário administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@finantrack.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Criar usuário comum de exemplo
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('✅ Usuários criados');

  // Criar categorias padrão para o usuário comum
  const incomeCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Salário',
        description: 'Salário mensal',
        color: '#10B981',
        type: 'INCOME',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Freelance',
        description: 'Trabalhos freelance',
        color: '#3B82F6',
        type: 'INCOME',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Investimentos',
        description: 'Rendimentos de investimentos',
        color: '#8B5CF6',
        type: 'INCOME',
        userId: user.id,
      },
    }),
  ]);

  const expenseCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Alimentação',
        description: 'Gastos com alimentação',
        color: '#F59E0B',
        type: 'EXPENSE',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Transporte',
        description: 'Gastos com transporte',
        color: '#EF4444',
        type: 'EXPENSE',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Moradia',
        description: 'Aluguel, condomínio, etc.',
        color: '#6B7280',
        type: 'EXPENSE',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Saúde',
        description: 'Gastos com saúde',
        color: '#EC4899',
        type: 'EXPENSE',
        userId: user.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Lazer',
        description: 'Entretenimento e lazer',
        color: '#06B6D4',
        type: 'EXPENSE',
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Categorias criadas');

  // Criar algumas transações de exemplo
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Transações de receita
  await Promise.all([
    prisma.transaction.create({
      data: {
        description: 'Salário Janeiro',
        amount: 5000.00,
        type: 'INCOME',
        date: new Date(currentYear, currentMonth, 1),
        userId: user.id,
        categoryId: incomeCategories[0].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: 'Projeto Freelance',
        amount: 1500.00,
        type: 'INCOME',
        date: new Date(currentYear, currentMonth, 15),
        userId: user.id,
        categoryId: incomeCategories[1].id,
      },
    }),
  ]);

  // Transações de despesa
  await Promise.all([
    prisma.transaction.create({
      data: {
        description: 'Supermercado',
        amount: 350.00,
        type: 'EXPENSE',
        date: new Date(currentYear, currentMonth, 5),
        userId: user.id,
        categoryId: expenseCategories[0].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: 'Combustível',
        amount: 200.00,
        type: 'EXPENSE',
        date: new Date(currentYear, currentMonth, 8),
        userId: user.id,
        categoryId: expenseCategories[1].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: 'Aluguel',
        amount: 1200.00,
        type: 'EXPENSE',
        date: new Date(currentYear, currentMonth, 10),
        userId: user.id,
        categoryId: expenseCategories[2].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: 'Cinema',
        amount: 50.00,
        type: 'EXPENSE',
        date: new Date(currentYear, currentMonth, 20),
        userId: user.id,
        categoryId: expenseCategories[4].id,
      },
    }),
  ]);

  console.log('✅ Transações criadas');

  // Criar meta mensal
  await prisma.monthlyGoal.create({
    data: {
      month: currentMonth + 1,
      year: currentYear,
      income: 6000.00,
      expense: 4000.00,
      userId: user.id,
    },
  });

  console.log('✅ Meta mensal criada');
  console.log('🎉 Seed concluído com sucesso!');
  
  console.log('\n📋 Dados criados:');
  console.log(`👤 Admin: admin@finantrack.com / admin123`);
  console.log(`👤 Usuário: joao@exemplo.com / user123`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
