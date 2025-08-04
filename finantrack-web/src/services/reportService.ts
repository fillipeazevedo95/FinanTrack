import { supabase } from '@/config/supabase';
import { DashboardData, MonthlyReport, CategoryReport, Transaction, MonthlyGoal } from '@/types';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

export const reportService = {
  // Obter resumo financeiro (dashboard)
  async getFinancialSummary(): Promise<DashboardData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Buscar transações do mês atual
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          date,
          categories!inner(name, color)
        `)
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      if (transactionsError) throw transactionsError;

      // Buscar meta do mês atual
      const { data: monthlyGoal } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();

      // Calcular totais
      const currentTransactions = transactions || [];
      const totalIncome = currentTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = currentTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Agrupar por categoria
      const categoryTotals = currentTransactions.reduce((acc: any, transaction) => {
        const categoryName = (transaction.categories as any)?.name || 'Sem categoria';
        const categoryColor = (transaction.categories as any)?.color || '#gray';
        const amount = Number(transaction.amount);

        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            color: categoryColor,
            total: 0,
            count: 0,
            type: transaction.type
          };
        }

        acc[categoryName].total += amount;
        acc[categoryName].count += 1;
        return acc;
      }, {});

      const categories = Object.values(categoryTotals) as CategoryReport[];

      // Buscar transações dos últimos 6 meses para tendência
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: trendData } = await supabase
        .from('monthly_summary')
        .select('*')
        .eq('user_id', user.id)
        .gte('month', sixMonthsAgo.toISOString())
        .order('month', { ascending: true })
        .limit(6);

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: currentTransactions.length,
        categories,
        monthlyGoal: monthlyGoal ? {
          id: monthlyGoal.id,
          month: monthlyGoal.month,
          year: monthlyGoal.year,
          income: Number(monthlyGoal.income),
          expense: Number(monthlyGoal.expense),
          userId: monthlyGoal.user_id,
          createdAt: monthlyGoal.created_at,
          updatedAt: monthlyGoal.updated_at
        } : null,
        recentTransactions: currentTransactions.slice(0, 5).map(t => ({
          id: crypto.randomUUID(),
          description: 'Transação',
          amount: Number(t.amount),
          type: t.type,
          date: t.date,
          categoryId: '',
          userId: user.id,
          notes: '',
          createdAt: t.date,
          updatedAt: t.date,
          category: {
            id: '',
            name: (t.categories as any)?.name || 'Sem categoria',
            color: (t.categories as any)?.color || '#gray',
            type: t.type,
            userId: user.id,
            createdAt: t.date,
            updatedAt: t.date
          }
        })) as Transaction[],
        trend: (trendData || []).map(d => ({
          month: d.month,
          income: Number(d.total_income),
          expense: Number(d.total_expense),
          balance: Number(d.balance)
        })),
        // Campos adicionais para compatibilidade com DashboardData
        period: {
          month: currentMonth,
          year: currentYear
        },
        currentBalance: totalIncome - totalExpense,
        monthlyIncome: totalIncome,
        monthlyExpense: totalExpense,
        categoryBreakdown: categories
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar resumo financeiro');
    }
  },

  // Obter relatório mensal
  async getMonthlyReport(month?: number, year?: number): Promise<MonthlyReport> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const currentDate = new Date();
      const targetMonth = month || (currentDate.getMonth() + 1);
      const targetYear = year || currentDate.getFullYear();

      // Buscar transações do mês
      const startOfMonth = new Date(targetYear, targetMonth - 1, 1).toISOString();
      const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories!inner(name, color, type)
        `)
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: false });

      if (error) throw error;

      const monthlyTransactions = transactions || [];
      const totalIncome = monthlyTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = monthlyTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Agrupar por categoria
      const categoryTotals = monthlyTransactions.reduce((acc: any, transaction) => {
        const categoryName = transaction.categories.name;
        const categoryColor = transaction.categories.color;
        const amount = Number(transaction.amount);

        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            color: categoryColor,
            total: 0,
            count: 0,
            type: transaction.type,
            percentage: 0
          };
        }

        acc[categoryName].total += amount;
        acc[categoryName].count += 1;
        return acc;
      }, {});

      const categories = Object.values(categoryTotals).map((cat: any) => ({
        ...cat,
        percentage: cat.type === 'INCOME' 
          ? totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0
          : totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0
      })) as CategoryReport[];

      return {
        month: targetMonth,
        year: targetYear,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: monthlyTransactions.length,
        categories,
        transactions: monthlyTransactions.map(t => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          type: t.type,
          date: t.date,
          categoryId: t.category_id,
          userId: t.user_id,
          notes: t.notes || '',
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          category: {
            id: (t.categories as any)?.id || '',
            name: (t.categories as any)?.name || 'Sem categoria',
            color: (t.categories as any)?.color || '#gray',
            type: (t.categories as any)?.type || t.type,
            userId: t.user_id,
            createdAt: t.created_at,
            updatedAt: t.updated_at
          }
        })) as Transaction[]
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar relatório mensal');
    }
  },

  // Obter relatório por período personalizado
  async getCustomPeriodReport(startDate: string, endDate: string): Promise<{
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    categories: CategoryReport[];
    transactions: any[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories!inner(name, color, type)
        `)
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      const periodTransactions = transactions || [];
      const totalIncome = periodTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = periodTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Agrupar por categoria
      const categoryTotals = periodTransactions.reduce((acc: any, transaction) => {
        const categoryName = transaction.categories.name;
        const categoryColor = transaction.categories.color;
        const amount = Number(transaction.amount);

        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            color: categoryColor,
            total: 0,
            count: 0,
            type: transaction.type,
            percentage: 0
          };
        }

        acc[categoryName].total += amount;
        acc[categoryName].count += 1;
        return acc;
      }, {});

      const categories = Object.values(categoryTotals).map((cat: any) => ({
        ...cat,
        percentage: cat.type === 'INCOME' 
          ? totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0
          : totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0
      })) as CategoryReport[];

      return {
        startDate,
        endDate,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: periodTransactions.length,
        categories,
        transactions: periodTransactions.map(t => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          type: t.type,
          date: t.date,
          categoryId: t.category_id,
          userId: t.user_id,
          notes: t.notes,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          category: {
            id: t.categories.id,
            name: t.categories.name,
            color: t.categories.color,
            type: t.categories.type
          }
        }))
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar relatório personalizado');
    }
  },

  // Obter notificações e alertas
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Por enquanto, gerar notificações sintéticas baseadas nos dados
      const notifications: Notification[] = [];

      // Verificar se há metas definidas para o mês atual
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { data: currentGoal } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();

      if (!currentGoal) {
        notifications.push({
          id: crypto.randomUUID(),
          type: 'info',
          title: 'Meta Mensal',
          message: 'Você não definiu metas para este mês. Que tal criar uma?',
          createdAt: new Date().toISOString()
        });
      }

      // Verificar gastos excessivos
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();

      const { data: monthlyExpenses } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'EXPENSE')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      const totalExpense = (monthlyExpenses || [])
        .reduce((sum, t) => sum + Number(t.amount), 0);

      if (currentGoal && totalExpense > Number(currentGoal.expense)) {
        notifications.push({
          id: crypto.randomUUID(),
          type: 'warning',
          title: 'Meta de Gastos Excedida',
          message: `Você já gastou R$ ${totalExpense.toFixed(2)} este mês, ultrapassando sua meta de R$ ${Number(currentGoal.expense).toFixed(2)}.`,
          createdAt: new Date().toISOString()
        });
      }

      return notifications;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar notificações');
    }
  },

  // Obter dados para gráficos
  async getChartData(type: 'trend' | 'category' | 'comparison', period?: string): Promise<any> {
    try {
      const monthlyReport = await this.getMonthlyReport();
      
      switch (type) {
        case 'trend':
          // Buscar dados dos últimos 6 meses
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuário não autenticado');

          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

          const { data: trendData } = await supabase
            .from('monthly_summary')
            .select('*')
            .eq('user_id', user.id)
            .gte('month', sixMonthsAgo.toISOString())
            .order('month', { ascending: true })
            .limit(6);

          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          
          return {
            labels: (trendData || []).map(d => {
              const date = new Date(d.month);
              return months[date.getMonth()];
            }),
            datasets: [
              {
                label: 'Receitas',
                data: (trendData || []).map(d => Number(d.total_income)),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
              },
              {
                label: 'Despesas',
                data: (trendData || []).map(d => Number(d.total_expense)),
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
              },
            ],
          };

        case 'category':
          return {
            labels: monthlyReport.categories.map(c => c.name),
            datasets: [
              {
                data: monthlyReport.categories.map(c => c.total),
                backgroundColor: monthlyReport.categories.map(c => c.color),
                borderWidth: 1,
              },
            ],
          };

        case 'comparison':
          return {
            labels: ['Receitas', 'Despesas'],
            datasets: [
              {
                data: [monthlyReport.totalIncome, monthlyReport.totalExpense],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                borderWidth: 1,
              },
            ],
          };

        default:
          throw new Error('Tipo de gráfico não suportado');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao obter dados do gráfico');
    }
  },
};