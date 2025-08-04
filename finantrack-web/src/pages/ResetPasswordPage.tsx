import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PasswordStrength, validatePassword } from '../components/ui/PasswordStrength';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  useEffect(() => {
    // Verificar se há um email de reset no localStorage
    const email = localStorage.getItem('resetEmail');
    if (email) {
      setResetEmail(email);
    }
  }, []);

  // Se não há email de reset, redirecionar para forgot password
  if (!resetEmail && !passwordReset) {
    return <Navigate to="/forgot-password" replace />;
  }



  const onSubmit = async (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        message: 'As senhas não coincidem'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simular redefinição de senha (em um app real, chamaria uma API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpar email do localStorage
      localStorage.removeItem('resetEmail');
      
      setPasswordReset(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError('root', {
        message: 'Erro ao redefinir senha. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };



  if (passwordReset) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Senha redefinida!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sua senha foi alterada com sucesso. Você será redirecionado para o login.
              </p>
            </div>

            <Card>
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Senha alterada com sucesso!
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        Agora você pode fazer login com sua nova senha.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ir para o login
                </Link>
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
              Criar nova senha
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redefinindo senha para: <span className="font-medium text-blue-600">{resetEmail}</span>
            </p>
          </div>

          {/* Form */}
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{errors.root.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="relative">
                  <Input
                    label="Nova senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Nova senha é obrigatória',
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

                {/* Password Strength Indicator */}
                <PasswordStrength password={password || ''} showRequirements={false} />
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Confirmar nova senha"
                    type={showConfirmPassword ? 'text' : 'password'}
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

              {/* Password Requirements */}
              <PasswordStrength password={password || ''} />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Redefinir senha
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Voltar para o login
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
