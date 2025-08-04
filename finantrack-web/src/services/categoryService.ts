import { api, ApiResponse, handleApiError } from './api';
import { Category, CategoryFormData } from '../types';

export const categoryService = {
  // Listar categorias
  async getCategories(type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    try {
      const params = type ? { type } : {};
      const response = await api.get<ApiResponse<Category[]>>('/categories', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar categorias');
      }
      
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter categoria por ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar categoria');
      }
      
      if (!response.data.data) {
        throw new Error('Categoria não encontrada');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Criar categoria
  async createCategory(data: CategoryFormData): Promise<Category> {
    try {
      const response = await api.post<ApiResponse<Category>>('/categories', data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao criar categoria');
      }
      
      if (!response.data.data) {
        throw new Error('Erro ao criar categoria');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Atualizar categoria
  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    try {
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao atualizar categoria');
      }
      
      if (!response.data.data) {
        throw new Error('Erro ao atualizar categoria');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Deletar categoria
  async deleteCategory(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/categories/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao deletar categoria');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
