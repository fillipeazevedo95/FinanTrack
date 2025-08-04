import { Transaction, UserSettings } from '../types/transactions';
import { User } from '../types';

// Função para obter o ID do usuário atual
export const getCurrentUserId = (): string | null => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson) as User;
    return user.id;
  } catch (error) {
    console.error('Erro ao obter ID do usuário:', error);
    return null;
  }
};

// Função para gerar chaves específicas do usuário
export const getUserSpecificKey = (baseKey: string): string => {
  const userId = getCurrentUserId();
  return userId ? `${baseKey}-${userId}` : baseKey;
};

// Chaves do localStorage
export const STORAGE_KEYS = {
  TRANSACTIONS: 'finantrack-transactions',
  USER_SETTINGS: 'finantrack-user-settings',
  USER_AVATAR: 'finantrack-user-avatar',
  THEME: 'finantrack-theme'
};

// Funções para transações
export const getTransactions = (): Transaction[] => {
  try {
    const key = getUserSpecificKey(STORAGE_KEYS.TRANSACTIONS);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    return [];
  }
};

export const saveTransaction = (transaction: Transaction): void => {
  try {
    const transactions = getTransactions();
    const existingIndex = transactions.findIndex(t => t.id === transaction.id);

    if (existingIndex >= 0) {
      transactions[existingIndex] = transaction;
    } else {
      transactions.push(transaction);
    }

    const key = getUserSpecificKey(STORAGE_KEYS.TRANSACTIONS);
    localStorage.setItem(key, JSON.stringify(transactions));
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    throw new Error('Não foi possível salvar a transação');
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    const key = getUserSpecificKey(STORAGE_KEYS.TRANSACTIONS);
    localStorage.setItem(key, JSON.stringify(transactions));
  } catch (error) {
    console.error('Erro ao salvar transações:', error);
    throw new Error('Não foi possível salvar as transações');
  }
};

export const deleteTransaction = (id: string): void => {
  try {
    const transactions = getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    const key = getUserSpecificKey(STORAGE_KEYS.TRANSACTIONS);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    throw new Error('Não foi possível excluir a transação');
  }
};

export const getTransactionsByType = (type: 'INCOME' | 'EXPENSE'): Transaction[] => {
  return getTransactions().filter(t => t.type === type);
};

// Funções para configurações do usuário
export const getUserSettings = (): UserSettings => {
  try {
    const key = getUserSpecificKey(STORAGE_KEYS.USER_SETTINGS);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {
      dateFormat: 'DD/MM/YYYY',
      language: 'pt',
      timezone: 'America/Sao_Paulo',
      autoBackup: 'weekly',
      currency: 'BRL'
    };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return {
      dateFormat: 'DD/MM/YYYY',
      language: 'pt',
      timezone: 'America/Sao_Paulo',
      autoBackup: 'weekly',
      currency: 'BRL'
    };
  }
};

export const saveUserSettings = (settings: UserSettings): void => {
  try {
    const key = getUserSpecificKey(STORAGE_KEYS.USER_SETTINGS);
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw new Error('Não foi possível salvar as configurações');
  }
};

// Funções para avatar
export const getUserAvatar = (): string => {
  try {
    const key = getUserSpecificKey(STORAGE_KEYS.USER_AVATAR);
    return localStorage.getItem(key) || '👤';
  } catch (error) {
    console.error('Erro ao carregar avatar:', error);
    return '👤';
  }
};

export const saveUserAvatar = (avatar: string): void => {
  try {
    const key = getUserSpecificKey(STORAGE_KEYS.USER_AVATAR);
    localStorage.setItem(key, avatar);
  } catch (error) {
    console.error('Erro ao salvar avatar:', error);
    throw new Error('Não foi possível salvar o avatar');
  }
};

// Função para exportar todos os dados do usuário
export const exportUserData = (): void => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('Tentativa de exportar dados sem usuário logado');
      throw new Error('Usuário não está logado');
    }
    
    const data = {
      transactions: getTransactions(),
      settings: getUserSettings(),
      avatar: getUserAvatar(),
      exportDate: new Date().toISOString(),
      userId
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finantrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    throw new Error('Não foi possível exportar os dados');
  }
};

// Função para limpar todos os dados do usuário atual
export const clearAllData = (): void => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('Tentativa de limpar dados sem usuário logado');
      return;
    }
    
    Object.values(STORAGE_KEYS).forEach(baseKey => {
      const key = getUserSpecificKey(baseKey);
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw new Error('Não foi possível limpar os dados');
  }
};

// Função para calcular totais
export const calculateTotals = (transactions?: Transaction[]) => {
  // Se não foram fornecidas transações, busca as do usuário atual
  const transactionList = transactions || getTransactions();
  const income = transactionList
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = Math.abs(transactionList
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0));

  return {
    income,
    expense,
    balance: income - expense
  };
};
