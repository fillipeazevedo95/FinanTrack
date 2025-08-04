import React, { useState } from 'react';
import { User, Bell, Shield, Download, Upload, Trash2, Save } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { getTransactions, saveTransactions } from '../utils/storage';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currency: 'BRL'
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    monthly: true
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'data', label: 'Dados', icon: Download }
  ];

  const handleProfileSave = () => {
    // Implementar salvamento do perfil
    alert('Perfil atualizado com sucesso!');
  };

  const handleExportData = () => {
    try {
      // Usar a função exportUserData do storage.ts
      import('../utils/storage').then(storage => {
        storage.exportUserData();
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Não foi possível exportar os dados');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedData)) {
            saveTransactions(importedData);
            alert('Dados importados com sucesso!');
            window.location.reload();
          } else {
            alert('Formato de arquivo inválido!');
          }
        } catch (error) {
          alert('Erro ao importar dados!');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      alert('Todos os dados foram apagados!');
      window.location.reload();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome completo"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Seu nome"
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
                <Input
                  label="Telefone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moeda
                  </label>
                  <select
                    value={profileData.currency}
                    onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={handleProfileSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Preferências de Notificação
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificações por email</p>
                    <p className="text-sm text-gray-500">Receba atualizações por email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificações push</p>
                    <p className="text-sm text-gray-500">Receba notificações no navegador</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Relatório semanal</p>
                    <p className="text-sm text-gray-500">Resumo semanal das suas finanças</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weekly}
                    onChange={(e) => setNotifications({ ...notifications, weekly: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Relatório mensal</p>
                    <p className="text-sm text-gray-500">Resumo mensal das suas finanças</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.monthly}
                    onChange={(e) => setNotifications({ ...notifications, monthly: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Segurança da Conta
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Ativar Autenticação em Duas Etapas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Gerenciar Sessões Ativas
                </Button>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Gerenciamento de Dados
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Exportar Dados</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Baixe uma cópia de todos os seus dados financeiros
                  </p>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Importar Dados</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Importe dados de um backup anterior
                  </p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                      id="import-file"
                    />
                    <label htmlFor="import-file">
                      <Button variant="outline" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivo
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="text-sm font-medium text-red-900 mb-2">Zona de Perigo</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Apagar todos os dados permanentemente
                  </p>
                  <Button onClick={handleClearData} variant="danger">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Apagar Todos os Dados
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Sidebar */}
          <div className="lg:w-64 mb-8 lg:mb-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <Card>
              {renderTabContent()}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
