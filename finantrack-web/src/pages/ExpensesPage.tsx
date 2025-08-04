import React, { useState, useEffect } from 'react';
import { Plus, TrendingDown, Edit, Trash2, Search } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useData } from '../contexts/DataContext';
import { getTransactions, saveTransaction, deleteTransaction } from '../utils/storage';
import { Transaction } from '../types/transactions';

export const ExpensesPage: React.FC = () => {
  const { refreshData } = useData();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Alimentação'
  });

  const expenseCategories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Roupas',
    'Outros'
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm]);

  const loadExpenses = () => {
    const allTransactions = getTransactions();
    const expenses = allTransactions.filter(t => t.type === 'EXPENSE');
    setTransactions(expenses);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      type: 'EXPENSE',
      description: formData.description,
      amount: -Math.abs(parseFloat(formData.amount)), // Garantir que seja negativo
      date: formData.date || new Date().toISOString().split('T')[0],
      category: formData.category,
      createdAt: editingTransaction?.createdAt || new Date().toISOString()
    } as Transaction;

    saveTransaction(transaction);
    loadExpenses();
    refreshData();
    resetForm();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(), // Mostrar valor positivo no form
      date: transaction.date,
      category: transaction.category
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      deleteTransaction(id);
      loadExpenses();
      refreshData();
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Alimentação'
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  const totalExpense = Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Controle seus gastos
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancelar' : 'Nova Despesa'}
          </Button>
        </div>

        {/* Summary */}
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Despesas</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </p>
              <p className="text-sm text-gray-500">
                {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''}
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        {showForm && (
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTransaction ? 'Editar Despesa' : 'Nova Despesa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Descrição"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Almoço no restaurante"
                  required
                />
                <Input
                  label="Valor"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
                <Input
                  label="Data"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    {expenseCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="submit" variant="danger">
                  {editingTransaction ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Transactions List */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Lista de Despesas
          </h3>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingDown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhuma despesa encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente buscar por outros termos.' : 'Comece adicionando sua primeira despesa.'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
