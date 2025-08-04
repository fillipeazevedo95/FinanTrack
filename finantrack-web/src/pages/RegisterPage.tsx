import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PasswordStrength, validatePassword } from '../components/ui/PasswordStrength';
import { RegisterFormData } from '../types';

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, register: registerUser, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm<RegisterFormData>();

  const password = watch('password');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        message: 'As senhas não coincidem'
      });
      return;
    }

    if (!data.acceptTerms) {
      setError('acceptTerms', {
        message: 'Você deve aceitar os termos de uso'
      });
      return;
    }

    try {
      await registerUser(data);
      // O redirecionamento será feito automaticamente pelo AuthContext
    } catch (error) {
      // O erro já é tratado pelo AuthContext
      console.error('Erro no registro:', error);
    }
  };

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Crie sua conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                faça login na sua conta existente
              </Link>
            </p>
          </div>

          {/* Register Form */}
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Seu nome"
                  error={errors.firstName?.message}
                  {...register('firstName', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Nome deve ter no máximo 50 caracteres'
                    }
                  })}
                />
                <Input
                  label="Sobrenome"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Seu sobrenome"
                  error={errors.lastName?.message}
                  {...register('lastName', {
                    required: 'Sobrenome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Sobrenome deve ter pelo menos 2 caracteres'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Sobrenome deve ter no máximo 50 caracteres'
                    }
                  })}
                />
              </div>

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

              <div>
                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
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
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                <div className="mt-2">
                  <PasswordStrength password={password || ''} />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Confirmar senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                      required: 'Confirmação de senha é obrigatória'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    {...register('acceptTerms', {
                      required: 'Você deve aceitar os termos de uso'
                    })}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="accept-terms" className="text-gray-700">
                    Eu aceito os{' '}
                    <Link
                      to="/terms"
                      className="font-medium text-blue-600 hover:text-blue-500"
                      target="_blank"
                    >
                      termos de uso
                    </Link>{' '}
                    e{' '}
                    <Link
                      to="/privacy"
                      className="font-medium text-blue-600 hover:text-blue-500"
                      target="_blank"
                    >
                      política de privacidade
                    </Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Criar conta
              </Button>
            </form>
          </Card>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link
                to="/terms"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link
                to="/privacy"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
