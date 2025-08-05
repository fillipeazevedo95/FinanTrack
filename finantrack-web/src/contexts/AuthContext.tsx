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
        console.log('Iniciando verificação de autenticação...');
        setIsLoading(true);
        
        // Timeout de segurança para evitar loading infinito
        const timeoutId = setTimeout(() => {
          console.warn('Timeout na verificação de autenticação');
          setIsLoading(false);
        }, 10000); // 10 segundos
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setIsLoading(false);
          return;
        }
        
        console.log('Sessão obtida:', session ? 'Ativa' : 'Inativa');
        
        if (session?.user) {
          try {
            const userData = await authService.getProfile();
            console.log('Perfil do usuário obtido:', userData);
            setUser(userData);
          } catch (profileError) {
            console.error('Erro ao obter perfil:', profileError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        setUser(null);
      } finally {
        console.log('Finalizando inicialização de auth');
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
            console.log('onAuthStateChange: Usuário logado, obtendo perfil...');
            
            // Timeout para evitar travamento no getProfile
            const profilePromise = authService.getProfile();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout no getProfile')), 8000)
            );
            
            const userData = await Promise.race([profilePromise, timeoutPromise]) as User;
            console.log('onAuthStateChange: Perfil obtido:', userData);
            setUser(userData);
          } catch (error) {
            console.error('Erro ao obter perfil após login:', error);
            // Em caso de erro, criar um usuário básico com dados do session
            if (session?.user) {
              const basicUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'Usuário',
                role: 'USER',
                avatar: session.user.user_metadata?.avatar_url,
                createdAt: session.user.created_at,
                updatedAt: session.user.updated_at || session.user.created_at
              };
              console.log('Usando usuário básico devido ao erro:', basicUser);
              setUser(basicUser);
            } else {
              setUser(null);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('onAuthStateChange: Usuário deslogado');
          setUser(null);
          clearUserData();
        }
        
        // Só definir loading como false na inicialização, não em mudanças de auth
        // pois pode interferir com operações de login/register em andamento
        if (event === 'INITIAL_SESSION') {
          setIsLoading(false);
        }
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
      console.log('AuthContext: Iniciando registro...');
      setIsLoading(true);
      
      const response = await authService.register(data);
      console.log('AuthContext: Registro bem-sucedido:', response.user);
      
      // Limpar dados de usuários anteriores
      clearUserData();
      
      setUser(response.user);
      console.log('AuthContext: Usuário definido no state');
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      console.error('AuthContext: Erro no registro:', error);
      const errorMessage = error.message || 'Erro ao criar conta';
      toast.error(errorMessage);
      throw error;
    } finally {
      console.log('AuthContext: Finalizando registro');
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
