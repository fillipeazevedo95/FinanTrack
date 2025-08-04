import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

// Schema de validação para meta mensal
const monthlyGoalSchema = z.object({
  month: z.number().min(1, 'Mês deve ser entre 1 e 12').max(12, 'Mês deve ser entre 1 e 12'),
  year: z.number().min(2020, 'Ano deve ser maior que 2020').max(2030, 'Ano deve ser menor que 2030'),
  income: z.number().min(0, 'Meta de receita deve ser positiva'),
  expense: z.number().min(0, 'Meta de despesa deve ser positiva'),
});

const updateMonthlyGoalSchema = monthlyGoalSchema.partial().omit({ month: true, year: true });

// Listar metas mensais do usuário
export const getMonthlyGoals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const goals = await prisma.monthlyGoal.findMany({
      where: {
        userId: req.user.id,
        year: currentYear
      },
      orderBy: { month: 'asc' }
    });

    // Para cada meta, calcular o progresso real
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const startOfMonth = new Date(goal.year, goal.month - 1, 1);
        const endOfMonth = new Date(goal.year, goal.month, 0, 23, 59, 59);

        const transactions = await prisma.transaction.findMany({
          where: {
            userId: req.user.id,
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        });

        const actualIncome = transactions
          .filter(t => t.type === 'INCOME')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const actualExpense = transactions
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const incomeProgress = Number(goal.income) > 0 ? (actualIncome / Number(goal.income)) * 100 : 0;
        const expenseProgress = Number(goal.expense) > 0 ? (actualExpense / Number(goal.expense)) * 100 : 0;

        return {
          ...goal,
          actualIncome,
          actualExpense,
          incomeProgress: Math.round(incomeProgress * 100) / 100,
          expenseProgress: Math.round(expenseProgress * 100) / 100,
          balance: actualIncome - actualExpense,
          goalBalance: Number(goal.income) - Number(goal.expense)
        };
      })
    );

    res.json({
      success: true,
      data: goalsWithProgress
    });
  } catch (error) {
    console.error('Erro ao buscar metas mensais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter meta mensal específica
export const getMonthlyGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { month, year } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Mês deve estar entre 1 e 12'
      });
    }

    const goal = await prisma.monthlyGoal.findFirst({
      where: {
        userId: req.user.id,
        month: monthNum,
        year: yearNum
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Meta mensal não encontrada'
      });
    }

    // Calcular progresso real
    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const actualIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const actualExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeProgress = Number(goal.income) > 0 ? (actualIncome / Number(goal.income)) * 100 : 0;
    const expenseProgress = Number(goal.expense) > 0 ? (actualExpense / Number(goal.expense)) * 100 : 0;

    const goalWithProgress = {
      ...goal,
      actualIncome,
      actualExpense,
      incomeProgress: Math.round(incomeProgress * 100) / 100,
      expenseProgress: Math.round(expenseProgress * 100) / 100,
      balance: actualIncome - actualExpense,
      goalBalance: Number(goal.income) - Number(goal.expense)
    };

    res.json({
      success: true,
      data: goalWithProgress
    });
  } catch (error) {
    console.error('Erro ao buscar meta mensal:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Criar ou atualizar meta mensal
export const setMonthlyGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const validatedData = monthlyGoalSchema.parse(req.body);

    // Verificar se já existe uma meta para este mês/ano
    const existingGoal = await prisma.monthlyGoal.findFirst({
      where: {
        userId: req.user.id,
        month: validatedData.month,
        year: validatedData.year
      }
    });

    let goal;
    let message;

    if (existingGoal) {
      // Atualizar meta existente
      goal = await prisma.monthlyGoal.update({
        where: { id: existingGoal.id },
        data: {
          income: validatedData.income,
          expense: validatedData.expense
        }
      });
      message = 'Meta mensal atualizada com sucesso';
    } else {
      // Criar nova meta
      goal = await prisma.monthlyGoal.create({
        data: {
          ...validatedData,
          userId: req.user.id
        }
      });
      message = 'Meta mensal criada com sucesso';
    }

    res.status(existingGoal ? 200 : 201).json({
      success: true,
      data: goal,
      message
    });
  } catch (error) {
    console.error('Erro ao definir meta mensal:', error);

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

// Atualizar meta mensal
export const updateMonthlyGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;
    const validatedData = updateMonthlyGoalSchema.parse(req.body);

    // Verificar se a meta existe e pertence ao usuário
    const existingGoal = await prisma.monthlyGoal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Meta mensal não encontrada'
      });
    }

    const updatedGoal = await prisma.monthlyGoal.update({
      where: { id },
      data: validatedData
    });

    res.json({
      success: true,
      data: updatedGoal,
      message: 'Meta mensal atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar meta mensal:', error);

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

// Deletar meta mensal
export const deleteMonthlyGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { id } = req.params;

    // Verificar se a meta existe e pertence ao usuário
    const goal = await prisma.monthlyGoal.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Meta mensal não encontrada'
      });
    }

    await prisma.monthlyGoal.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Meta mensal deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar meta mensal:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
