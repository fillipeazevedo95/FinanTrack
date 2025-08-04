import { supabase } from '@/config/supabase';
import { Category, CategoryFormData } from '@/types';
import type { Category as DBCategory, CategoryInsert, CategoryUpdate } from '@/types/database';

// Helper para converter categoria do banco para o formato da aplicação
const mapCategory = (dbCategory: DBCategory): Category => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || undefined,
    color: dbCategory.color,
    type: dbCategory.type,
    userId: dbCategory.user_id,
    isActive: dbCategory.is_active,
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at
  };
};

export const categoryService = {
  // Listar categorias
  async getCategories(type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(mapCategory);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar categorias');
    }
  },

  // Obter categoria por ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Categoria não encontrada');

      return mapCategory(data);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar categoria');
    }
  },

  // Criar categoria
  async createCategory(data: CategoryFormData): Promise<Category> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const insertData: CategoryInsert = {
        name: data.name,
        description: data.description || null,
        color: data.color || '#3B82F6',
        type: data.type,
        user_id: user.id
      };

      const { data: category, error } = await supabase
        .from('categories')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      if (!category) throw new Error('Erro ao criar categoria');

      return mapCategory(category);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar categoria');
    }
  },

  // Atualizar categoria
  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: CategoryUpdate = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.type !== undefined) updateData.type = data.type;

      const { data: category, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .select()
        .single();

      if (error) throw error;
      if (!category) throw new Error('Categoria não encontrada');

      return mapCategory(category);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar categoria');
    }
  },

  // Deletar categoria (soft delete)
  async deleteCategory(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se há transações usando esta categoria
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .eq('user_id', user.id)
        .limit(1);

      if (transactionError) throw transactionError;

      if (transactions && transactions.length > 0) {
        throw new Error('Não é possível excluir categoria que possui transações associadas');
      }

      // Soft delete - marcar como inativo
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deletar categoria');
    }
  },

  // Obter categorias com contagem de transações
  async getCategoriesWithTransactionCount(type?: 'INCOME' | 'EXPENSE'): Promise<(Category & { transactionCount: number })[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('categories')
        .select(`
          *,
          transactions!inner(id)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...mapCategory(item),
        transactionCount: item.transactions?.length || 0
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar categorias com contagem');
    }
  }
};
