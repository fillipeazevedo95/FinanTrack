import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterFormData } from '@/types';
import { authService } from '@/services/authService';
import { supabase } from '@/config/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sessão ativa ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await authService.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (error) {
            console.error('Erro ao obter perfil após login:', error);
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          clearUserData();
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Função para limpar dados de transações e configurações do usuário atual
  const clearUserData = (): void => {
    // Limpar dados locais se necessário
    // Como estamos usando Supabase, a maioria dos dados já são isolados por usuário
    console.log('Limpando dados do usuário');
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authService.login(email, password);
      
      // Limpar dados de usuários anteriores
      clearUserData();
      
      setUser(response.user);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authService.register(data);
      
      // Limpar dados de usuários anteriores
      clearUserData();
      
      setUser(response.user);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar conta';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      clearUserData();
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      clearUserData();
    }
  };

  const updateUser = async (data: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    clearUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
