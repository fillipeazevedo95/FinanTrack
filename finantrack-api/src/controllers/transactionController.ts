import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

// Schema de validação para transação
const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição deve ter no máximo 200 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Tipo é obrigatório' }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inválida'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional(),
});

const updateTransactionSchema = transactionSchema.partial();

// Listar transações do usuário
export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const {
      page = '1',
      limit = '10',
      type,
      categoryId,
      startDate,
      endDate,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const whereClause: any = {
      userId: req.user.id
    };

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      whereClause.type = type;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate as string);
      }
    }

    if (search) {
      whereClause.description = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    // Buscar transações
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              type: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter transação por ID
export const getTransactionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            type: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Criar nova transação
export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const validatedData = transactionSchema.parse(req.body);

    // Verificar se a categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Categoria não encontrada ou inválida'
      });
    }

    // Verificar se o tipo da transação corresponde ao tipo da categoria
    if (validatedData.type !== category.type) {
      return res.status(400).json({
        success: false,
        error: 'Tipo da transação deve corresponder ao tipo da categoria'
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        userId: req.user.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            type: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transação criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar transação
export const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;
    const validatedData = updateTransactionSchema.parse(req.body);

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    // Se está alterando a categoria, verificar se ela existe e pertence ao usuário
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: req.user.id,
          isActive: true
        }
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Categoria não encontrada ou inválida'
        });
      }

      // Verificar se o tipo da transação corresponde ao tipo da categoria
      const transactionType = validatedData.type || existingTransaction.type;
      if (transactionType !== category.type) {
        return res.status(400).json({
          success: false,
          error: 'Tipo da transação deve corresponder ao tipo da categoria'
        });
      }
    }

    // Preparar dados para atualização
    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            type: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedTransaction,
      message: 'Transação atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar transação
export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;

    // Verificar se a transação existe e pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Transação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
