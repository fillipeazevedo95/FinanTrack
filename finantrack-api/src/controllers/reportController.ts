import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { NotificationService } from '../services/notificationService';

// Schema de validação para filtros de relatório
const reportFiltersSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2020).max(2030).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inicial inválida').optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data final inválida').optional(),
});

// Obter resumo financeiro
export const getFinancialSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Filtros para o mês atual
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Buscar transações do mês atual
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
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

    // Calcular totais
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyBalance = monthlyIncome - monthlyExpense;

    // Buscar saldo total (todas as transações)
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        date: { lte: endOfMonth }
      }
    });

    const totalIncome = allTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = allTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentBalance = totalIncome - totalExpense;

    // Buscar meta mensal
    const monthlyGoal = await prisma.monthlyGoal.findFirst({
      where: {
        userId: req.user!.id,
        month: currentMonth,
        year: currentYear
      }
    });

    // Transações recentes (últimas 5)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
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
      take: 5
    });

    return res.json({
      success: true,
      data: {
        currentBalance,
        monthlyIncome,
        monthlyExpense,
        monthlyBalance,
        monthlyGoal,
        recentTransactions,
        period: {
          month: currentMonth,
          year: currentYear
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter resumo financeiro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter relatório mensal
export const getMonthlyReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { month, year } = req.query;
    const currentDate = new Date();
    const reportMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;
    const reportYear = year ? parseInt(year as string) : currentDate.getFullYear();

    // Validar parâmetros
    if (reportMonth < 1 || reportMonth > 12) {
      return res.status(400).json({
        success: false,
        error: 'Mês deve estar entre 1 e 12'
      });
    }

    // Filtros para o mês especificado
    const startOfMonth = new Date(reportYear, reportMonth - 1, 1);
    const endOfMonth = new Date(reportYear, reportMonth, 0, 23, 59, 59);

    // Buscar transações do mês
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
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
      },
      orderBy: { date: 'desc' }
    });

    // Calcular totais
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    // Agrupar por categoria
    const categoryBreakdown = transactions.reduce((acc: any, transaction) => {
      const categoryId = transaction.category.id;
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: transaction.category.id,
          name: transaction.category.name,
          color: transaction.category.color,
          type: transaction.category.type,
          total: 0,
          transactionCount: 0
        };
      }
      
      acc[categoryId].total += Number(transaction.amount);
      acc[categoryId].transactionCount += 1;
      
      return acc;
    }, {});

    // Converter para array e calcular percentuais
    const categories = Object.values(categoryBreakdown).map((category: any) => {
      const baseTotal = category.type === 'INCOME' ? totalIncome : totalExpense;
      const percentage = baseTotal > 0 ? (category.total / baseTotal) * 100 : 0;
      
      return {
        ...category,
        percentage: Math.round(percentage * 100) / 100
      };
    });

    // Buscar meta mensal
    const monthlyGoal = await prisma.monthlyGoal.findFirst({
      where: {
        userId: req.user!.id,
        month: reportMonth,
        year: reportYear
      }
    });

    return res.json({
      success: true,
      data: {
        month: reportMonth,
        year: reportYear,
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length,
        categories,
        monthlyGoal,
        transactions
      }
    });
  } catch (error) {
    console.error('Erro ao obter relatório mensal:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter relatório por período personalizado
export const getCustomPeriodReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Data inicial e final são obrigatórias'
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (start > end) {
      return res.status(400).json({
        success: false,
        error: 'Data inicial deve ser anterior à data final'
      });
    }

    // Buscar transações do período
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        date: {
          gte: start,
          lte: end
        }
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
      },
      orderBy: { date: 'desc' }
    });

    // Calcular totais
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    // Agrupar por categoria
    const categoryBreakdown = transactions.reduce((acc: any, transaction) => {
      const categoryId = transaction.category.id;
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: transaction.category.id,
          name: transaction.category.name,
          color: transaction.category.color,
          type: transaction.category.type,
          total: 0,
          transactionCount: 0
        };
      }
      
      acc[categoryId].total += Number(transaction.amount);
      acc[categoryId].transactionCount += 1;
      
      return acc;
    }, {});

    // Converter para array e calcular percentuais
    const categories = Object.values(categoryBreakdown).map((category: any) => {
      const baseTotal = category.type === 'INCOME' ? totalIncome : totalExpense;
      const percentage = baseTotal > 0 ? (category.total / baseTotal) * 100 : 0;
      
      return {
        ...category,
        percentage: Math.round(percentage * 100) / 100
      };
    });

    return res.json({
      success: true,
      data: {
        startDate: startDate as string,
        endDate: endDate as string,
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length,
        categories,
        transactions
      }
    });
  } catch (error) {
    console.error('Erro ao obter relatório personalizado:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter notificações e alertas financeiros
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const notifications = await NotificationService.getAllNotifications(req.user!.id);

    return res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erro ao obter notificações:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
