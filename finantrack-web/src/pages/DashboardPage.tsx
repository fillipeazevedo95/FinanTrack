import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
// import { useData } from '../contexts/DataContext'; // Para uso futuro
import { calculateTotals, getTransactions } from '../utils/storage';
import { Transaction } from '../types/transactions';

export const DashboardPage: React.FC = () => {
  // const { refreshData } = useData(); // Para uso futuro
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState({
    income: 0,
    expense: 0,
    balance: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const allTransactions = getTransactions();
    const calculatedTotals = calculateTotals(allTransactions);
    
    setTransactions(allTransactions.slice(0, 5)); // Últimas 5 transações
    setTotals(calculatedTotals);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visão geral das suas finanças
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="success" size="sm" as="a" href="/income">
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
            <Button variant="danger" size="sm" as="a" href="/expenses">
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Receitas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totals.income)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Despesas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totals.expense)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  totals.balance >= 0 ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <DollarSign className={`h-5 w-5 ${
                    totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <p className={`text-2xl font-bold ${
                  totals.balance >= 0 ? 'text-blue-900' : 'text-red-900'
                }`}>
                  {formatCurrency(totals.balance)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Transações Recentes
            </h3>
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'INCOME' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhuma transação
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando uma receita ou despesa.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <Button variant="success" size="sm" as="a" href="/income">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
                <Button variant="danger" size="sm" as="a" href="/expenses">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
