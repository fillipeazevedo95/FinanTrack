import prisma from '../config/database';
import { FinancialService } from './financialService';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
}

export class NotificationService {
  // Gerar alertas financeiros para um usuário
  static async generateFinancialAlerts(userId: string): Promise<Notification[]> {
    const alerts: Notification[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
      // Verificar status do orçamento mensal
      const budgetStatus = await FinancialService.checkBudgetStatus(
        userId,
        currentMonth,
        currentYear
      );

      if (budgetStatus.hasGoal) {
        // Alerta de gastos excessivos
        if (budgetStatus.status.expense === 'over') {
          alerts.push({
            id: `expense-over-${userId}-${currentMonth}-${currentYear}`,
            type: 'danger',
            title: 'Gastos acima da meta',
            message: `Você já gastou R$ ${budgetStatus.actual.totalExpense.toFixed(2)} este mês, ultrapassando sua meta de R$ ${Number(budgetStatus.goal.expense).toFixed(2)}.`,
            data: {
              actual: budgetStatus.actual.totalExpense,
              goal: Number(budgetStatus.goal.expense),
              percentage: (budgetStatus.actual.totalExpense / Number(budgetStatus.goal.expense)) * 100
            },
            createdAt: new Date()
          });
        }

        // Alerta de receita baixa
        if (budgetStatus.status.income === 'under') {
          alerts.push({
            id: `income-under-${userId}-${currentMonth}-${currentYear}`,
            type: 'warning',
            title: 'Receita abaixo da meta',
            message: `Sua receita atual de R$ ${budgetStatus.actual.totalIncome.toFixed(2)} está abaixo da meta de R$ ${Number(budgetStatus.goal.income).toFixed(2)}.`,
            data: {
              actual: budgetStatus.actual.totalIncome,
              goal: Number(budgetStatus.goal.income),
              percentage: (budgetStatus.actual.totalIncome / Number(budgetStatus.goal.income)) * 100
            },
            createdAt: new Date()
          });
        }

        // Alerta de saldo negativo
        if (budgetStatus.actual.balance < 0) {
          alerts.push({
            id: `negative-balance-${userId}-${currentMonth}-${currentYear}`,
            type: 'danger',
            title: 'Saldo negativo',
            message: `Seu saldo atual está negativo em R$ ${Math.abs(budgetStatus.actual.balance).toFixed(2)}.`,
            data: {
              balance: budgetStatus.actual.balance
            },
            createdAt: new Date()
          });
        }

        // Alerta de aproximação do limite de gastos (80% da meta)
        const expensePercentage = (budgetStatus.actual.totalExpense / Number(budgetStatus.goal.expense)) * 100;
        if (expensePercentage >= 80 && expensePercentage < 100) {
          alerts.push({
            id: `expense-warning-${userId}-${currentMonth}-${currentYear}`,
            type: 'warning',
            title: 'Aproximando do limite de gastos',
            message: `Você já gastou ${expensePercentage.toFixed(1)}% da sua meta mensal de despesas.`,
            data: {
              percentage: expensePercentage,
              remaining: Number(budgetStatus.goal.expense) - budgetStatus.actual.totalExpense
            },
            createdAt: new Date()
          });
        }
      }

      // Detectar gastos incomuns
      const unusualExpenses = await FinancialService.detectUnusualExpenses(userId);
      if (unusualExpenses.length > 0) {
        const totalUnusual = unusualExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        alerts.push({
          id: `unusual-expenses-${userId}-${Date.now()}`,
          type: 'info',
          title: 'Gastos incomuns detectados',
          message: `Detectamos ${unusualExpenses.length} transação(ões) com valores acima do seu padrão usual, totalizando R$ ${totalUnusual.toFixed(2)}.`,
          data: {
            transactions: unusualExpenses.slice(0, 3), // Mostrar apenas as 3 primeiras
            total: totalUnusual,
            count: unusualExpenses.length
          },
          createdAt: new Date()
        });
      }

      // Verificar se não há transações recentes (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentTransactions = await prisma.transaction.count({
        where: {
          userId,
          date: {
            gte: sevenDaysAgo
          }
        }
      });

      if (recentTransactions === 0) {
        alerts.push({
          id: `no-recent-transactions-${userId}`,
          type: 'info',
          title: 'Nenhuma transação recente',
          message: 'Você não registrou nenhuma transação nos últimos 7 dias. Lembre-se de manter seu controle financeiro atualizado.',
          createdAt: new Date()
        });
      }

      // Verificar categorias sem uso (mais de 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const unusedCategories = await prisma.category.findMany({
        where: {
          userId,
          isActive: true,
          transactions: {
            none: {
              date: {
                gte: thirtyDaysAgo
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      if (unusedCategories.length > 0) {
        const categoriesWithTransactions = unusedCategories.filter(c => c._count.transactions > 0);
        if (categoriesWithTransactions.length > 0) {
          alerts.push({
            id: `unused-categories-${userId}`,
            type: 'info',
            title: 'Categorias sem uso recente',
            message: `Você tem ${categoriesWithTransactions.length} categoria(s) que não são usadas há mais de 30 dias.`,
            data: {
              categories: categoriesWithTransactions.slice(0, 5).map(c => c.name),
              count: categoriesWithTransactions.length
            },
            createdAt: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Erro ao gerar alertas financeiros:', error);
    }

    return alerts;
  }

  // Gerar dicas financeiras personalizadas
  static async generateFinancialTips(userId: string): Promise<Notification[]> {
    const tips: Notification[] = [];

    try {
      // Analisar padrões de gastos dos últimos 3 meses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const categorySummary = await FinancialService.calculateCategorySummary(
        userId,
        threeMonthsAgo
      );

      const expenseCategories = categorySummary.filter(c => c.type === 'EXPENSE');

      if (expenseCategories.length > 0) {
        // Dica sobre a categoria com maior gasto
        const topExpenseCategory = expenseCategories[0];
        if (topExpenseCategory.percentage > 40) {
          tips.push({
            id: `tip-top-expense-${userId}`,
            type: 'info',
            title: 'Dica de economia',
            message: `${topExpenseCategory.percentage.toFixed(1)}% dos seus gastos são com "${topExpenseCategory.name}". Considere revisar esses gastos para encontrar oportunidades de economia.`,
            data: {
              category: topExpenseCategory
            },
            createdAt: new Date()
          });
        }

        // Dica sobre diversificação de gastos
        if (expenseCategories.length < 3) {
          tips.push({
            id: `tip-diversification-${userId}`,
            type: 'info',
            title: 'Organize melhor seus gastos',
            message: 'Você usa poucas categorias para seus gastos. Criar mais categorias específicas pode ajudar a ter um controle mais detalhado.',
            createdAt: new Date()
          });
        }
      }

      // Dica sobre economia baseada na tendência mensal
      const monthlyTrend = await FinancialService.calculateMonthlyTrend(userId, 3);
      if (monthlyTrend.length >= 2) {
        const lastMonth = monthlyTrend[monthlyTrend.length - 1];
        const previousMonth = monthlyTrend[monthlyTrend.length - 2];

        if (lastMonth.expense > previousMonth.expense * 1.2) {
          tips.push({
            id: `tip-expense-increase-${userId}`,
            type: 'warning',
            title: 'Gastos em alta',
            message: `Seus gastos aumentaram ${(((lastMonth.expense - previousMonth.expense) / previousMonth.expense) * 100).toFixed(1)}% em relação ao mês anterior. Revise seus gastos recentes.`,
            data: {
              currentMonth: lastMonth.expense,
              previousMonth: previousMonth.expense,
              increase: lastMonth.expense - previousMonth.expense
            },
            createdAt: new Date()
          });
        }

        if (lastMonth.income < previousMonth.income * 0.8) {
          tips.push({
            id: `tip-income-decrease-${userId}`,
            type: 'info',
            title: 'Receita em baixa',
            message: 'Sua receita diminuiu em relação ao mês anterior. Considere buscar fontes de renda complementares.',
            data: {
              currentMonth: lastMonth.income,
              previousMonth: previousMonth.income,
              decrease: previousMonth.income - lastMonth.income
            },
            createdAt: new Date()
          });
        }
      }

      // Dica sobre meta mensal
      const currentDate = new Date();
      const hasGoal = await prisma.monthlyGoal.findFirst({
        where: {
          userId,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });

      if (!hasGoal) {
        tips.push({
          id: `tip-set-goal-${userId}`,
          type: 'info',
          title: 'Defina suas metas',
          message: 'Você ainda não definiu uma meta financeira para este mês. Definir metas ajuda a manter o controle dos gastos.',
          createdAt: new Date()
        });
      }

    } catch (error) {
      console.error('Erro ao gerar dicas financeiras:', error);
    }

    return tips;
  }

  // Combinar alertas e dicas
  static async getAllNotifications(userId: string): Promise<Notification[]> {
    const [alerts, tips] = await Promise.all([
      this.generateFinancialAlerts(userId),
      this.generateFinancialTips(userId)
    ]);

    // Combinar e ordenar por prioridade (danger > warning > info > success)
    const allNotifications = [...alerts, ...tips];
    
    const priorityOrder = { danger: 0, warning: 1, info: 2, success: 3 };
    
    return allNotifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Se mesma prioridade, ordenar por data (mais recente primeiro)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
}
