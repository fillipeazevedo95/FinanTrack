import { supabase } from '@/config/supabase';
import { MonthlyGoal, MonthlyGoalFormData } from '@/types';
import type { MonthlyGoal as DBMonthlyGoal, MonthlyGoalInsert, MonthlyGoalUpdate } from '@/types/database';

// Helper para converter meta do banco para o formato da aplicação
const mapMonthlyGoal = (dbGoal: DBMonthlyGoal): MonthlyGoal => {
  return {
    id: dbGoal.id,
    month: dbGoal.month,
    year: dbGoal.year,
    income: Number(dbGoal.income),
    expense: Number(dbGoal.expense),
    userId: dbGoal.user_id,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at
  };
};

export interface MonthlyGoalWithProgress extends MonthlyGoal {
  actualIncome: number;
  actualExpense: number;
  incomeProgress: number;
  expenseProgress: number;
  balance: number;
  goalBalance: number;
}

// Helper para calcular progresso da meta
const calculateProgress = async (goal: MonthlyGoal): Promise<MonthlyGoalWithProgress> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar transações do mês
  const startDate = new Date(goal.year, goal.month - 1, 1).toISOString();
  const endDate = new Date(goal.year, goal.month, 0, 23, 59, 59).toISOString();

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  const actualIncome = (transactions || [])
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const actualExpense = (transactions || [])
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    ...goal,
    actualIncome,
    actualExpense,
    incomeProgress: goal.income > 0 ? (actualIncome / goal.income) * 100 : 0,
    expenseProgress: goal.expense > 0 ? (actualExpense / goal.expense) * 100 : 0,
    balance: actualIncome - actualExpense,
    goalBalance: goal.income - goal.expense
  };
};

export const goalService = {
  // Listar metas mensais
  async getMonthlyGoals(year?: number): Promise<MonthlyGoalWithProgress[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;
      if (error) throw error;

      const goals = (data || []).map(mapMonthlyGoal);
      
      // Calcular progresso para cada meta
      const goalsWithProgress = await Promise.all(
        goals.map(goal => calculateProgress(goal))
      );

      return goalsWithProgress;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar metas mensais');
    }
  },

  // Obter meta mensal específica
  async getMonthlyGoal(month: number, year: number): Promise<MonthlyGoalWithProgress> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Meta mensal não encontrada');

      const goal = mapMonthlyGoal(data);
      return await calculateProgress(goal);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar meta mensal');
    }
  },

  // Criar ou atualizar meta mensal
  async setMonthlyGoal(data: MonthlyGoalFormData): Promise<MonthlyGoal> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Converter strings para numbers se necessário
      const income = typeof data.income === 'string' ? parseFloat(data.income) : data.income;
      const expense = typeof data.expense === 'string' ? parseFloat(data.expense) : data.expense;

      const insertData: MonthlyGoalInsert = {
        month: data.month,
        year: data.year,
        income,
        expense,
        user_id: user.id
      };

      // Usar upsert para criar ou atualizar
      const { data: goal, error } = await supabase
        .from('monthly_goals')
        .upsert(insertData, {
          onConflict: 'month,year,user_id'
        })
        .select()
        .single();

      if (error) throw error;
      if (!goal) throw new Error('Erro ao definir meta mensal');

      return mapMonthlyGoal(goal);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao definir meta mensal');
    }
  },

  // Atualizar meta mensal
  async updateMonthlyGoal(id: string, data: Partial<MonthlyGoalFormData>): Promise<MonthlyGoal> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: MonthlyGoalUpdate = {};
      
      if (data.month !== undefined) updateData.month = data.month;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.income !== undefined) {
        updateData.income = typeof data.income === 'string' ? parseFloat(data.income) : data.income;
      }
      if (data.expense !== undefined) {
        updateData.expense = typeof data.expense === 'string' ? parseFloat(data.expense) : data.expense;
      }

      const { data: goal, error } = await supabase
        .from('monthly_goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!goal) throw new Error('Meta mensal não encontrada');

      return mapMonthlyGoal(goal);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar meta mensal');
    }
  },

  // Deletar meta mensal
  async deleteMonthlyGoal(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('monthly_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deletar meta mensal');
    }
  },

  // Obter meta do mês atual
  async getCurrentMonthGoal(): Promise<MonthlyGoalWithProgress | null> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      return await this.getMonthlyGoal(currentMonth, currentYear);
    } catch (error) {
      // Se não encontrar meta para o mês atual, retornar null
      if (error instanceof Error && error.message.includes('não encontrada')) {
        return null;
      }
      throw error;
    }
  },
};
