import { api, ApiResponse, handleApiError } from './api';
import { DashboardData, MonthlyReport, CategoryReport } from '../types';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

export const reportService = {
  // Obter resumo financeiro (dashboard)
  async getFinancialSummary(): Promise<DashboardData> {
    try {
      const response = await api.get<ApiResponse<DashboardData>>('/reports/summary');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar resumo financeiro');
      }
      
      if (!response.data.data) {
        throw new Error('Dados não encontrados');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter relatório mensal
  async getMonthlyReport(month?: number, year?: number): Promise<MonthlyReport> {
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await api.get<ApiResponse<MonthlyReport>>('/reports/monthly', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar relatório mensal');
      }
      
      if (!response.data.data) {
        throw new Error('Dados não encontrados');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter relatório por período personalizado
  async getCustomPeriodReport(startDate: string, endDate: string): Promise<{
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    categories: CategoryReport[];
    transactions: any[];
  }> {
    try {
      const params = { startDate, endDate };
      const response = await api.get<ApiResponse<any>>('/reports/custom', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar relatório personalizado');
      }
      
      if (!response.data.data) {
        throw new Error('Dados não encontrados');
      }
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter notificações e alertas
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get<ApiResponse<Notification[]>>('/reports/notifications');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar notificações');
      }
      
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Obter dados para gráficos
  async getChartData(type: 'trend' | 'category' | 'comparison', period?: string): Promise<any> {
    try {
      // Por enquanto, vamos usar os dados do relatório mensal
      const monthlyReport = await this.getMonthlyReport();
      
      switch (type) {
        case 'trend':
          // Simular dados de tendência mensal
          return {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [
              {
                label: 'Receitas',
                data: [6500, 7200, 6800, 7500, 6900, monthlyReport.totalIncome],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
              },
              {
                label: 'Despesas',
                data: [4200, 4800, 5200, 4600, 4900, monthlyReport.totalExpense],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
              },
            ],
          };

        case 'category':
          return {
            labels: monthlyReport.categories.map(c => c.name),
            datasets: [
              {
                data: monthlyReport.categories.map(c => c.total),
                backgroundColor: monthlyReport.categories.map(c => c.color),
                borderWidth: 1,
              },
            ],
          };

        case 'comparison':
          return {
            labels: ['Receitas', 'Despesas'],
            datasets: [
              {
                data: [monthlyReport.totalIncome, monthlyReport.totalExpense],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                borderWidth: 1,
              },
            ],
          };

        default:
          throw new Error('Tipo de gráfico não suportado');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
