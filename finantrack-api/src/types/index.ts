import { Request } from 'express';
import { User } from '@prisma/client';

// Extensão do Request do Express para incluir usuário autenticado
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// DTOs para criação e atualização
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  color?: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
}

export interface CreateMonthlyGoalDTO {
  month: number;
  year: number;
  income: number;
  expense: number;
}

// Tipos para filtros e consultas
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE';
  page?: number;
  limit?: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: number;
  categories: {
    id: string;
    name: string;
    total: number;
    percentage: number;
  }[];
}

// Resposta padrão da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Configurações JWT
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
