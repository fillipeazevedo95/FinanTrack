import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, DollarSign, CheckCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simular envio de email (em um app real, chamaria uma API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Salvar email no localStorage para usar na página de reset
      localStorage.setItem('resetEmail', data.email);
      
      setEmailSent(true);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Success State */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Email enviado!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enviamos as instruções para redefinir sua senha para:
              </p>
              <p className="mt-1 text-sm font-medium text-blue-600">
                {getValues('email')}
              </p>
            </div>

            <Card>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Verifique sua caixa de entrada
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Clique no link que enviamos para redefinir sua senha. 
                          Se não encontrar o email, verifique sua pasta de spam.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-500">
                    Não recebeu o email?
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Tentar novamente
                  </Button>
                  
                  {/* Link para página de reset (simulação) */}
                  <Link
                    to="/reset-password"
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ir para redefinição de senha
                  </Link>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para o login
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Esqueceu sua senha?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite seu email e enviaremos instruções para redefinir sua senha
            </p>
          </div>

          {/* Form */}
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
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
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Enviar instruções
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          </Card>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Lembrou da senha?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
