import { api, ApiResponse, PaginatedResponse, handleApiError } from './api';
import { Transaction, TransactionFormData, TransactionFilters } from '../types';

export const transactionService = {
  // Listar transações
  async getTransactions(filters?: TransactionFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    try {
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.search && { search: filters.search }),
      };

      const response = await api.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar transações');
      }
      
      return response.data.data || { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter transação por ID
  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar transação');
      }
      
      if (!response.data.data) {
        throw new Error('Transação não encontrada');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Criar transação
  async createTransaction(data: TransactionFormData): Promise<Transaction> {
    try {
      // Converter string para number se necessário
      const payload = {
        ...data,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      };

      const response = await api.post<ApiResponse<Transaction>>('/transactions', payload);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao criar transação');
      }
      
      if (!response.data.data) {
        throw new Error('Erro ao criar transação');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Atualizar transação
  async updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
    try {
      // Converter string para number se necessário
      const payload = {
        ...data,
        ...(data.amount && { 
          amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount 
        }),
      };

      const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao atualizar transação');
      }
      
      if (!response.data.data) {
        throw new Error('Erro ao atualizar transação');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Deletar transação
  async deleteTransaction(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/transactions/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao deletar transação');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter resumo de transações
  async getTransactionSummary(filters?: TransactionFilters): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }> {
    try {
      const transactions = await this.getTransactions({ ...filters, limit: 1000 });
      
      const totalIncome = transactions.data
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions.data
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.data.length,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
