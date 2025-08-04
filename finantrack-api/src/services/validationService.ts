import prisma from '../config/database';
import { z } from 'zod';

export class ValidationService {
  // Validar se o usuário pode criar uma categoria
  static async validateCategoryCreation(
    userId: string,
    name: string,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<{ isValid: boolean; error?: string }> {
    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: name.trim(),
        type,
        isActive: true
      }
    });

    if (existingCategory) {
      return {
        isValid: false,
        error: `Já existe uma categoria de ${type === 'INCOME' ? 'receita' : 'despesa'} com o nome "${name}"`
      };
    }

    // Verificar limite de categorias por usuário (máximo 50)
    const categoryCount = await prisma.category.count({
      where: {
        userId,
        isActive: true
      }
    });

    if (categoryCount >= 50) {
      return {
        isValid: false,
        error: 'Limite máximo de 50 categorias atingido'
      };
    }

    return { isValid: true };
  }

  // Validar se uma categoria pode ser deletada
  static async validateCategoryDeletion(
    userId: string,
    categoryId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    // Verificar se a categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
        isActive: true
      },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    if (!category) {
      return {
        isValid: false,
        error: 'Categoria não encontrada'
      };
    }

    // Verificar se há transações associadas
    if (category._count.transactions > 0) {
      return {
        isValid: false,
        error: `Não é possível deletar a categoria "${category.name}" pois ela possui ${category._count.transactions} transação(ões) associada(s)`
      };
    }

    return { isValid: true };
  }

  // Validar dados de transação
  static async validateTransactionData(
    userId: string,
    data: {
      amount: number;
      categoryId: string;
      type: 'INCOME' | 'EXPENSE';
      date: string;
    }
  ): Promise<{ isValid: boolean; error?: string }> {
    // Validar valor
    if (data.amount <= 0) {
      return {
        isValid: false,
        error: 'O valor deve ser maior que zero'
      };
    }

    if (data.amount > 999999.99) {
      return {
        isValid: false,
        error: 'O valor não pode ser maior que R$ 999.999,99'
      };
    }

    // Validar data
    const transactionDate = new Date(data.date);
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    if (transactionDate < oneYearAgo) {
      return {
        isValid: false,
        error: 'A data da transação não pode ser anterior a um ano'
      };
    }

    if (transactionDate > oneYearFromNow) {
      return {
        isValid: false,
        error: 'A data da transação não pode ser posterior a um ano'
      };
    }

    // Validar categoria
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId,
        isActive: true
      }
    });

    if (!category) {
      return {
        isValid: false,
        error: 'Categoria não encontrada ou inválida'
      };
    }

    // Verificar se o tipo da transação corresponde ao tipo da categoria
    if (data.type !== category.type) {
      return {
        isValid: false,
        error: `Esta categoria é para ${category.type === 'INCOME' ? 'receitas' : 'despesas'}, mas você está tentando criar uma ${data.type === 'INCOME' ? 'receita' : 'despesa'}`
      };
    }

    return { isValid: true };
  }

  // Validar limite de transações por dia
  static async validateDailyTransactionLimit(
    userId: string,
    date: string
  ): Promise<{ isValid: boolean; error?: string }> {
    const transactionDate = new Date(date);
    const startOfDay = new Date(transactionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(transactionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyTransactionCount = await prisma.transaction.count({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (dailyTransactionCount >= 100) {
      return {
        isValid: false,
        error: 'Limite máximo de 100 transações por dia atingido'
      };
    }

    return { isValid: true };
  }

  // Validar meta mensal
  static async validateMonthlyGoal(
    userId: string,
    data: {
      month: number;
      year: number;
      income: number;
      expense: number;
    }
  ): Promise<{ isValid: boolean; error?: string }> {
    // Validar valores
    if (data.income < 0 || data.expense < 0) {
      return {
        isValid: false,
        error: 'Os valores de receita e despesa devem ser positivos'
      };
    }

    if (data.income > 9999999.99 || data.expense > 9999999.99) {
      return {
        isValid: false,
        error: 'Os valores não podem ser maiores que R$ 9.999.999,99'
      };
    }

    // Validar se o mês/ano não é muito antigo ou futuro
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (data.year < currentYear - 2) {
      return {
        isValid: false,
        error: 'Não é possível definir metas para anos anteriores a 2 anos'
      };
    }

    if (data.year > currentYear + 1) {
      return {
        isValid: false,
        error: 'Não é possível definir metas para mais de 1 ano no futuro'
      };
    }

    return { isValid: true };
  }

  // Validar se o usuário pode acessar um recurso
  static async validateResourceOwnership(
    userId: string,
    resourceType: 'category' | 'transaction' | 'goal',
    resourceId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    let resource;

    switch (resourceType) {
      case 'category':
        resource = await prisma.category.findFirst({
          where: { id: resourceId, userId }
        });
        break;
      case 'transaction':
        resource = await prisma.transaction.findFirst({
          where: { id: resourceId, userId }
        });
        break;
      case 'goal':
        resource = await prisma.monthlyGoal.findFirst({
          where: { id: resourceId, userId }
        });
        break;
    }

    if (!resource) {
      return {
        isValid: false,
        error: `${resourceType} não encontrado(a) ou você não tem permissão para acessá-lo(a)`
      };
    }

    return { isValid: true };
  }

  // Validar dados de perfil do usuário
  static validateUserProfile(data: {
    name?: string;
    email?: string;
    avatar?: string;
  }): { isValid: boolean; error?: string } {
    const schema = z.object({
      name: z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .optional(),
      email: z.string()
        .email('Email inválido')
        .max(255, 'Email deve ter no máximo 255 caracteres')
        .optional(),
      avatar: z.string()
        .url('URL do avatar inválida')
        .max(500, 'URL do avatar deve ter no máximo 500 caracteres')
        .optional()
    });

    try {
      schema.parse(data);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Erro de validação'
        };
      }
      return {
        isValid: false,
        error: 'Dados inválidos'
      };
    }
  }

  // Validar senha
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 6) {
      return {
        isValid: false,
        error: 'A senha deve ter pelo menos 6 caracteres'
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        error: 'A senha deve ter no máximo 128 caracteres'
      };
    }

    // Verificar se contém pelo menos uma letra e um número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        error: 'A senha deve conter pelo menos uma letra e um número'
      };
    }

    return { isValid: true };
  }

  // Validar filtros de busca
  static validateSearchFilters(filters: {
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
  }): { isValid: boolean; error?: string; parsedFilters?: any } {
    try {
      const parsedFilters: any = {};

      // Validar datas
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (isNaN(startDate.getTime())) {
          return { isValid: false, error: 'Data inicial inválida' };
        }
        parsedFilters.startDate = startDate;
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (isNaN(endDate.getTime())) {
          return { isValid: false, error: 'Data final inválida' };
        }
        parsedFilters.endDate = endDate;
      }

      // Verificar se a data inicial é anterior à final
      if (parsedFilters.startDate && parsedFilters.endDate && 
          parsedFilters.startDate > parsedFilters.endDate) {
        return { isValid: false, error: 'Data inicial deve ser anterior à data final' };
      }

      // Validar paginação
      if (filters.page) {
        const page = parseInt(filters.page);
        if (isNaN(page) || page < 1) {
          return { isValid: false, error: 'Página deve ser um número maior que 0' };
        }
        parsedFilters.page = page;
      }

      if (filters.limit) {
        const limit = parseInt(filters.limit);
        if (isNaN(limit) || limit < 1 || limit > 100) {
          return { isValid: false, error: 'Limite deve ser um número entre 1 e 100' };
        }
        parsedFilters.limit = limit;
      }

      return { isValid: true, parsedFilters };
    } catch (error) {
      return { isValid: false, error: 'Filtros inválidos' };
    }
  }
}
