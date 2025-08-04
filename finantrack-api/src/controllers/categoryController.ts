import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

// Schema de validação para categoria
const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)').optional(),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Tipo é obrigatório' }),
});

const updateCategorySchema = categorySchema.partial();

// Listar categorias do usuário
export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { type } = req.query;

    const whereClause: any = {
      userId: req.user.id,
      isActive: true
    };

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      whereClause.type = type;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter categoria por ID
export const getCategoryById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user.id,
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
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Criar nova categoria
export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const validatedData = categorySchema.parse(req.body);

    // Verificar se já existe uma categoria com o mesmo nome para o usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: validatedData.name,
        userId: req.user.id,
        isActive: true
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma categoria com este nome'
      });
    }

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoria criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);

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

// Atualizar categoria
export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);

    // Verificar se a categoria existe e pertence ao usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Se está alterando o nome, verificar se não existe outra categoria com o mesmo nome
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: validatedData.name,
          userId: req.user.id,
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateCategory) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma categoria com este nome'
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData
    });

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Categoria atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);

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

// Deletar categoria (soft delete)
export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;

    // Verificar se a categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user.id,
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
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se a categoria tem transações associadas
    if (category._count.transactions > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar uma categoria que possui transações associadas'
      });
    }

    // Soft delete
    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
