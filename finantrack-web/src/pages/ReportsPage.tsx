import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { getTransactions, calculateTotals } from '../utils/storage';
import { Transaction } from '../types/transactions';

export const ReportsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [categoryData, setCategoryData] = useState<{ [key: string]: number }>({});
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([]);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = () => {
    const allTransactions = getTransactions();
    setTransactions(allTransactions);
    
    // Processar dados por categoria
    const categories: { [key: string]: number } = {};
    const expenses = allTransactions.filter(t => t.type === 'EXPENSE');
    
    expenses.forEach(transaction => {
      const category = transaction.category;
      categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
    });
    
    setCategoryData(categories);

    // Processar dados mensais (últimos 6 meses)
    const monthlyStats: { [key: string]: { income: number; expense: number } } = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[monthKey] = { income: 0, expense: 0 };
    }

    allTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyStats[monthKey]) {
        if (transaction.type === 'INCOME') {
          monthlyStats[monthKey].income += transaction.amount;
        } else {
          monthlyStats[monthKey].expense += Math.abs(transaction.amount);
        }
      }
    });

    const monthlyArray = Object.entries(monthlyStats).map(([monthKey, data]) => ({
      month: new Date(monthKey + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      income: data.income,
      expense: data.expense
    }));

    setMonthlyData(monthlyArray);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totals = calculateTotals(transactions);
  const totalCategories = Object.keys(categoryData).length;
  const topCategory = Object.entries(categoryData).sort(([,a], [,b]) => b - a)[0];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="mt-1 text-sm text-gray-500">
              Análise detalhada das suas finanças
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="month">Este mês</option>
              <option value="quarter">Últimos 3 meses</option>
              <option value="year">Este ano</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Receitas</p>
                <p className="text-xl font-bold text-gray-900">
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
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totals.expense)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <p className={`text-xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.balance)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Categorias</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalCategories}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trend */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Evolução Mensal
            </h3>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {data.month}
                  </span>
                  <div className="flex space-x-4">
                    <span className="text-sm text-green-600">
                      +{formatCurrency(data.income)}
                    </span>
                    <span className="text-sm text-red-600">
                      -{formatCurrency(data.expense)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Gastos por Categoria
            </h3>
            <div className="space-y-4">
              {Object.entries(categoryData)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([category, amount]) => {
                  const percentage = totalCategories > 0 ? (amount / totals.expense) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {category}
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Insights Financeiros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Resumo do Período</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Total de transações: {transactions.length}</li>
                <li>• Receitas: {transactions.filter(t => t.type === 'INCOME').length}</li>
                <li>• Despesas: {transactions.filter(t => t.type === 'EXPENSE').length}</li>
                <li>• Média diária de gastos: {formatCurrency(totals.expense / 30)}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Principais Categorias</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {topCategory && (
                  <li>• Maior gasto: {topCategory[0]} ({formatCurrency(topCategory[1])})</li>
                )}
                <li>• Categorias ativas: {totalCategories}</li>
                <li>• Taxa de poupança: {totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : 0}%</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
