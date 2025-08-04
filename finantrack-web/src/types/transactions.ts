export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  isRecurring?: boolean;
  recurringId?: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  nextDueDate: string;
  createdAt: string;
  lastProcessed?: string;
}

export interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  category: string;
  newCategory?: string;
  isRecurring?: boolean;
  frequency?: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  endDate?: string;
}

export interface UserSettings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  language: 'pt' | 'en' | 'es';
  timezone: string;
  autoBackup: 'daily' | 'weekly' | 'monthly';
  currency: 'BRL' | 'USD' | 'EUR';
}

export const INCOME_CATEGORIES = [
  'Salário',
  'Serviços Extras',
  'Freelance',
  'Investimentos',
  'Outros'
];

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Outros'
];
