import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterFormData } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Modo de desenvolvimento (sem backend)
const DEV_MODE = !process.env.REACT_APP_API_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          if (DEV_MODE) {
            // Modo de desenvolvimento - usar dados do localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
              setUser(JSON.parse(userData));
            }
          } else {
            // Modo produção - verificar token com API
            const userData = await authService.getProfile();
            setUser(userData);
          }
        }
      } catch (error) {
        // Token inválido, remover do localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.error('Token inválido:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Função para limpar dados de transações e configurações do usuário atual
  const clearUserData = (): void => {
    // Não precisamos mais limpar todos os dados, pois agora cada usuário tem suas próprias chaves
    // A função clearAllData no storage.ts já cuida de limpar apenas os dados do usuário atual
    // Mantemos esta função para compatibilidade com o código existente
    if (user && user.id) {
      // Importar a função clearAllData do storage.ts causaria dependência circular
      // Então vamos apenas manter esta função vazia por enquanto
      console.log('Dados do usuário atual serão gerenciados por chaves específicas');
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      if (DEV_MODE) {
        // Modo de desenvolvimento - simular login
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Gerar um ID único baseado no email para garantir que cada usuário tenha seu próprio espaço de armazenamento
        const uniqueId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        
        const mockUser: User = {
          id: uniqueId,
          name: 'Usuário Teste',
          email: email,
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Limpar dados de usuários anteriores
        clearUserData();
        
        localStorage.setItem('token', 'dev-token-123');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        // Modo produção - usar API
        const response = await authService.login(email, password);
        
        // Limpar dados de usuários anteriores
        clearUserData();
        
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }

      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      setIsLoading(true);

      if (DEV_MODE) {
        // Modo de desenvolvimento - simular registro
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Gerar um ID único baseado no email para garantir que cada usuário tenha seu próprio espaço de armazenamento
        const uniqueId = `user_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        
        const mockUser: User = {
          id: uniqueId,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          role: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Limpar dados de usuários anteriores
        clearUserData();
        
        localStorage.setItem('token', 'dev-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        // Modo produção - usar API
        const response = await authService.register(data);
        
        // Limpar dados de usuários anteriores
        clearUserData();
        
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }

      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao criar conta';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Remover token e dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Limpar estado do usuário
    setUser(null);

    toast.success('Logout realizado com sucesso!');
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
