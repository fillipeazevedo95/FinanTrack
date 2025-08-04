import { api, ApiResponse, handleApiError } from './api';
import { MonthlyGoal, MonthlyGoalFormData } from '../types';

export interface MonthlyGoalWithProgress extends MonthlyGoal {
  actualIncome: number;
  actualExpense: number;
  incomeProgress: number;
  expenseProgress: number;
  balance: number;
  goalBalance: number;
}

export const goalService = {
  // Listar metas mensais
  async getMonthlyGoals(year?: number): Promise<MonthlyGoalWithProgress[]> {
    try {
      const params = year ? { year } : {};
      const response = await api.get<ApiResponse<MonthlyGoalWithProgress[]>>('/goals', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar metas mensais');
      }
      
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter meta mensal específica
  async getMonthlyGoal(month: number, year: number): Promise<MonthlyGoalWithProgress> {
    try {
      const response = await api.get<ApiResponse<MonthlyGoalWithProgress>>(`/goals/${month}/${year}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar meta mensal');
      }
      
      if (!response.data.data) {
        throw new Error('Meta mensal não encontrada');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Criar ou atualizar meta mensal
  async setMonthlyGoal(data: MonthlyGoalFormData): Promise<MonthlyGoal> {
    try {
      // Converter strings para numbers se necessário
      const payload = {
        ...data,
        income: typeof data.income === 'string' ? parseFloat(data.income) : data.income,
        expense: typeof data.expense === 'string' ? parseFloat(data.expense) : data.expense,
      };

      const response = await api.post<ApiResponse<MonthlyGoal>>('/goals', payload);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao definir meta mensal');
      }
      
      if (!response.data.data) {
        throw new Error('Erro ao definir meta mensal');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Atualizar meta mensal
  async updateMonthlyGoal(id: string, data: Partial<MonthlyGoalFormData>): Promise<MonthlyGoal> {
    try {
      // Converter strings para numbers se necessário
      const payload = {
        ...data,
        ...(data.income && { 
          income: typeof data.income === 'string' ? parseFloat(data.income) : data.income 
        }),
        ...(data.expense && { 
          expense: typeof data.expense === 'string' ? parseFloat(data.expense) : data.expense 
        }),
      };

      const response = await api.put<ApiResponse<MonthlyGoal>>(`/goals/${id}`, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao atualizar meta mensal');
      }
      
      if (!response.data.data) {
        throw new Error('Erro ao atualizar meta mensal');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Deletar meta mensal
  async deleteMonthlyGoal(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/goals/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao deletar meta mensal');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
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
