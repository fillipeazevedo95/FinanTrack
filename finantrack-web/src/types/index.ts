// Tipos de usuário
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de categoria
export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de transação
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  userId: string;
  categoryId: string;
  category: Category;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de meta mensal
export interface MonthlyGoal {
  id: string;
  month: number;
  year: number;
  income: number;
  expense: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para formulários
export interface CategoryFormData {
  name: string;
  description?: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface TransactionFormData {
  description: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
  notes?: string;
  isRecurring?: boolean;
  frequency?: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  endDate?: string;
}

export interface MonthlyGoalFormData {
  month: number;
  year: number;
  income: number | string;
  expense: number | string;
}

// Tipos para filtros
export interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Tipos para relatórios
export interface CategoryReport {
  id: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categories: CategoryReport[];
  monthlyGoal?: MonthlyGoal;
  transactions: Transaction[];
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categories: CategoryReport[];
  monthlyGoal: MonthlyGoal | null;
  recentTransactions: Transaction[];
  trend: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  period?: {
    month: number;
    year: number;
  };
  currentBalance: number;
  monthlyIncome: number;  
  monthlyExpense: number;
  categoryBreakdown: CategoryReport[];
}

// DTOs para formulários
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms?: boolean;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface TransactionFormData {
  description: string;
  amount: string | number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
  notes?: string;
  isRecurring?: boolean;
  frequency?: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  endDate?: string;
}

export interface MonthlyGoalFormData {
  month: number;
  year: number;
  income: string | number;
  expense: string | number;
}

// Tipos para filtros
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE';
  search?: string;
}

// Tipos para relatórios
export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categories: CategoryReport[];
}

export interface CategoryReport {
  id: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

// Interface removida - declaração consolidada acima

// Tipos para resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tipos para paginação
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearUserData: () => void;
}

// Tipos para cores de categoria
export const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];
