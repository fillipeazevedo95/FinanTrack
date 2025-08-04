import prisma from '../config/database';
import { Transaction, Category } from '@prisma/client';

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export class FinancialService {
  // Calcular resumo financeiro para um período
  static async calculateFinancialSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<FinancialSummary> {
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length
    };
  }

  // Calcular resumo por categoria
  static async calculateCategorySummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CategorySummary[]> {
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true
      }
    });

    // Calcular totais por tipo
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Agrupar por categoria
    const categoryMap = new Map<string, CategorySummary>();

    transactions.forEach(transaction => {
      const categoryId = transaction.category.id;
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: transaction.category.id,
          name: transaction.category.name,
          color: transaction.category.color,
          type: transaction.category.type as 'INCOME' | 'EXPENSE',
          total: 0,
          percentage: 0,
          transactionCount: 0
        });
      }

      const category = categoryMap.get(categoryId)!;
      category.total += Number(transaction.amount);
      category.transactionCount += 1;
    });

    // Calcular percentuais
    const categories = Array.from(categoryMap.values()).map(category => {
      const baseTotal = category.type === 'INCOME' ? totalIncome : totalExpense;
      const percentage = baseTotal > 0 ? (category.total / baseTotal) * 100 : 0;
      
      return {
        ...category,
        percentage: Math.round(percentage * 100) / 100
      };
    });

    return categories.sort((a, b) => b.total - a.total);
  }

  // Calcular tendência mensal
  static async calculateMonthlyTrend(
    userId: string,
    months: number = 12
  ): Promise<MonthlyTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months + 1);
    startDate.setDate(1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Agrupar por mês/ano
    const monthlyData = new Map<string, MonthlyTrend>();

    // Inicializar todos os meses no período
    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      monthlyData.set(key, {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        income: 0,
        expense: 0,
        balance: 0
      });
    }

    // Somar transações por mês
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthData = monthlyData.get(key);

      if (monthData) {
        if (transaction.type === 'INCOME') {
          monthData.income += Number(transaction.amount);
        } else {
          monthData.expense += Number(transaction.amount);
        }
        monthData.balance = monthData.income - monthData.expense;
      }
    });

    return Array.from(monthlyData.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }

  // Verificar se o usuário está dentro do orçamento
  static async checkBudgetStatus(
    userId: string,
    month: number,
    year: number
  ): Promise<{
    hasGoal: boolean;
    goal?: any;
    actual: FinancialSummary;
    status: {
      income: 'under' | 'on_track' | 'over';
      expense: 'under' | 'on_track' | 'over';
      overall: 'good' | 'warning' | 'danger';
    };
  }> {
    // Buscar meta mensal
    const goal = await prisma.monthlyGoal.findFirst({
      where: { userId, month, year }
    });

    // Calcular valores reais do mês
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const actual = await this.calculateFinancialSummary(
      userId,
      startOfMonth,
      endOfMonth
    );

    if (!goal) {
      return {
        hasGoal: false,
        actual,
        status: {
          income: 'on_track',
          expense: 'on_track',
          overall: 'good'
        }
      };
    }

    // Calcular status
    const incomeGoal = Number(goal.income);
    const expenseGoal = Number(goal.expense);

    const incomeRatio = incomeGoal > 0 ? actual.totalIncome / incomeGoal : 1;
    const expenseRatio = expenseGoal > 0 ? actual.totalExpense / expenseGoal : 0;

    const incomeStatus = incomeRatio < 0.8 ? 'under' : incomeRatio > 1.2 ? 'over' : 'on_track';
    const expenseStatus = expenseRatio < 0.8 ? 'under' : expenseRatio > 1.2 ? 'over' : 'on_track';

    let overall: 'good' | 'warning' | 'danger' = 'good';
    if (expenseStatus === 'over' || incomeStatus === 'under') {
      overall = actual.balance < 0 ? 'danger' : 'warning';
    }

    return {
      hasGoal: true,
      goal,
      actual,
      status: {
        income: incomeStatus,
        expense: expenseStatus,
        overall
      }
    };
  }

  // Obter transações recentes
  static async getRecentTransactions(
    userId: string,
    limit: number = 5
  ): Promise<(Transaction & { category: Category })[]> {
    return await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: limit
    });
  }

  // Calcular média de gastos por categoria
  static async calculateAverageExpenseByCategory(
    userId: string,
    months: number = 6
  ): Promise<CategorySummary[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { category: true }
    });

    const categoryMap = new Map<string, CategorySummary>();

    transactions.forEach(transaction => {
      const categoryId = transaction.category.id;
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: transaction.category.id,
          name: transaction.category.name,
          color: transaction.category.color,
          type: transaction.category.type as 'INCOME' | 'EXPENSE',
          total: 0,
          percentage: 0,
          transactionCount: 0
        });
      }

      const category = categoryMap.get(categoryId)!;
      category.total += Number(transaction.amount);
      category.transactionCount += 1;
    });

    // Calcular média mensal
    const categories = Array.from(categoryMap.values()).map(category => ({
      ...category,
      total: category.total / months, // Média mensal
      percentage: 0 // Será calculado depois se necessário
    }));

    return categories.sort((a, b) => b.total - a.total);
  }

  // Detectar gastos incomuns
  static async detectUnusualExpenses(
    userId: string,
    threshold: number = 2 // Desvio padrão
  ): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE'
      },
      orderBy: { date: 'desc' },
      take: 100 // Últimas 100 transações
    });

    if (transactions.length < 10) return []; // Dados insuficientes

    const amounts = transactions.map(t => Number(t.amount));
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const unusualThreshold = mean + (threshold * stdDev);

    return transactions.filter(t => Number(t.amount) > unusualThreshold);
  }
}
