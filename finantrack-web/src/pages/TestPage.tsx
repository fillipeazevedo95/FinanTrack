import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordStrength, validatePassword } from '../components/ui/PasswordStrength';

interface TestFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const TestPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<TestFormData>();

  const password = watch('password');

  const onSubmit = async (data: TestFormData) => {
    setIsLoading(true);
    console.log('Dados do formulário:', data);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Formulário enviado com sucesso!\nVerifique o console para ver os dados.');
    setIsLoading(false);
    reset();
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Página de Teste</h1>
          <p className="mt-1 text-sm text-gray-500">
            Teste todos os componentes e validações
          </p>
        </div>

        {/* Formulário de Teste */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Teste de Componentes UI
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <Input
              label="Nome completo"
              placeholder="Digite seu nome"
              error={errors.name?.message}
              {...register('name', {
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                }
              })}
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
            />

            {/* Senha */}
            <div>
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    validate: validatePassword
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {/* Indicador de Força da Senha */}
              <div className="mt-2">
                <PasswordStrength password={password || ''} />
              </div>
            </div>

            {/* Confirmar Senha */}
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value) => {
                  if (value !== password) {
                    return 'As senhas não coincidem';
                  }
                  return true;
                }
              })}
            />

            {/* Botões */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="flex-1"
              >
                Enviar Formulário
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isLoading}
              >
                Limpar
              </Button>
            </div>
          </form>
        </Card>

        {/* Teste de Botões */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Variações de Botões
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="outline">Outline</Button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <div className="mt-4">
            <Button loading={true} disabled>
              Loading Button
            </Button>
          </div>
        </Card>

        {/* Teste de Inputs */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Variações de Inputs
          </h2>
          
          <div className="space-y-4">
            <Input
              label="Input Normal"
              placeholder="Digite algo..."
            />
            
            <Input
              label="Input com Erro"
              placeholder="Este campo tem erro"
              error="Este é um exemplo de mensagem de erro"
            />
            
            <Input
              label="Input com Helper Text"
              placeholder="Digite sua idade"
              helperText="Sua idade deve ser entre 18 e 100 anos"
            />
            
            <Input
              label="Input Desabilitado"
              placeholder="Este campo está desabilitado"
              disabled
            />
          </div>
        </Card>

        {/* Instruções */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Instruções de Teste
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Formulário Principal:</strong> Teste todas as validações deixando campos vazios</p>
            <p>• <strong>Email:</strong> Teste com emails inválidos (sem @, sem domínio, etc.)</p>
            <p>• <strong>Senha:</strong> Veja o indicador de força mudando conforme você digita</p>
            <p>• <strong>Confirmação:</strong> Digite senhas diferentes para ver a validação</p>
            <p>• <strong>Botões:</strong> Teste todos os estados e variações</p>
            <p>• <strong>Console:</strong> Abra o DevTools para ver os dados enviados</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
