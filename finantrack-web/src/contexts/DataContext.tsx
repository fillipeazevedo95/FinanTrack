import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '../types/transactions';
import { getTransactions, saveTransaction, deleteTransaction } from '../utils/storage';

interface DataContextType {
  transactions: Transaction[];
  refreshData: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para carregar dados
  const loadData = async () => {
    setIsLoading(true);
    try {
      const transactionsData = await getTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar dados
  const refreshData = () => {
    loadData();
    // Disparar evento customizado para outros componentes
    window.dispatchEvent(new CustomEvent('finantrack-data-updated'));
  };

  // Adicionar transação
  const addTransaction = async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const newTransaction = {
      ...transactionData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    } as Transaction;

    saveTransaction(newTransaction);
    setTransactions(prev => [newTransaction, ...prev]);
    refreshData();
    return newTransaction;
  };

  // Atualizar transação
  const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<Transaction | null> => {
    const transactions = getTransactions();
    const transactionIndex = transactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) return null;

    const transaction = transactions[transactionIndex];
    if (!transaction) return null;

    // Merge os dados mantendo a tipagem correta
    Object.assign(transaction, data);

    // Usar a função saveTransactions do storage.ts em vez de acessar diretamente o localStorage
    import('../utils/storage').then(storage => {
      storage.saveTransactions(transactions);
    });
    
    setTransactions(transactions);
    refreshData();
    return transaction;
  };

  // Deletar transação
  const deleteTransactionById = async (id: string): Promise<boolean> => {
    try {
      deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      refreshData();
      return true;
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      return false;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Escutar eventos de atualização de dados
  useEffect(() => {
    const handleDataUpdate = () => {
      loadData();
    };

    window.addEventListener('finantrack-data-updated', handleDataUpdate);
    return () => {
      window.removeEventListener('finantrack-data-updated', handleDataUpdate);
    };
  }, []);

  const value: DataContextType = {
    transactions,
    refreshData,
    addTransaction,
    updateTransaction,
    deleteTransaction: deleteTransactionById,
    isLoading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
