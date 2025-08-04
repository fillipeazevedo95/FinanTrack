import { supabase } from '@/config/supabase';
import { Transaction, TransactionFormData, TransactionFilters } from '@/types';
import type { Transaction as DBTransaction, TransactionInsert, TransactionUpdate } from '@/types/database';

// Interface para resposta paginada
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper para converter transação do banco para o formato da aplicação
const mapTransaction = (dbTransaction: DBTransaction & { categories?: any }): Transaction => {
  return {
    id: dbTransaction.id,
    description: dbTransaction.description,
    amount: Number(dbTransaction.amount),
    type: dbTransaction.type,
    date: dbTransaction.date,
    categoryId: dbTransaction.category_id,
    userId: dbTransaction.user_id,
    notes: dbTransaction.notes || '',
    createdAt: dbTransaction.created_at,
    updatedAt: dbTransaction.updated_at,
    category: dbTransaction.categories ? {
      id: dbTransaction.categories.id,
      name: dbTransaction.categories.name,
      color: dbTransaction.categories.color,
      type: dbTransaction.categories.type,
      userId: dbTransaction.user_id,
      isActive: true,
      createdAt: dbTransaction.created_at,
      updatedAt: dbTransaction.updated_at
    } : {
      id: '',
      name: 'Sem categoria',
      color: '#gray',
      type: dbTransaction.type,
      userId: dbTransaction.user_id,
      isActive: true,
      createdAt: dbTransaction.created_at,
      updatedAt: dbTransaction.updated_at
    }
  };
};

export const transactionService = {
  // Listar transações
  async getTransactions(filters?: TransactionFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      // Construir query
      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories!inner(id, name, color, type)
        `, { count: 'exact' })
        .eq('user_id', user.id);

      // Aplicar filtros
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      // Paginação e ordenação
      const { data, error, count } = await query
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const transactions = (data || []).map(mapTransaction);

      return {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar transações');
    }
  },

  // Obter transação por ID
  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories!inner(id, name, color, type)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Transação não encontrada');

      return mapTransaction(data);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar transação');
    }
  },

  // Criar transação
  async createTransaction(data: TransactionFormData): Promise<Transaction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Converter string para number se necessário
      const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;

      const insertData: TransactionInsert = {
        description: data.description,
        amount,
        type: data.type,
        date: data.date,
        category_id: data.categoryId,
        user_id: user.id,
        notes: data.notes || null
      };

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert(insertData)
        .select(`
          *,
          categories!inner(id, name, color, type)
        `)
        .single();

      if (error) throw error;
      if (!transaction) throw new Error('Erro ao criar transação');

      return mapTransaction(transaction);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar transação');
    }
  },

  // Atualizar transação
  async updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: TransactionUpdate = {};
      
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) {
        updateData.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
      }
      if (data.type !== undefined) updateData.type = data.type;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      const { data: transaction, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          categories!inner(id, name, color, type)
        `)
        .single();

      if (error) throw error;
      if (!transaction) throw new Error('Transação não encontrada');

      return mapTransaction(transaction);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar transação');
    }
  },

  // Deletar transação
  async deleteTransaction(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deletar transação');
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Construir query
      let query = supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user.id);

      // Aplicar filtros
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transactions = data || [];
      
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
        transactionCount: transactions.length,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao obter resumo');
    }
  },
};
