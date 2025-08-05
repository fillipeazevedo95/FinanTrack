import { supabase } from '@/config/supabase';
import { User, RegisterFormData } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User;
  token: string;
}

// Helper para converter usuário do Supabase para o formato da aplicação
const mapSupabaseUser = (supabaseUser: SupabaseUser, profile?: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || 'Usuário',
    role: profile?.role || 'USER',
    avatar: profile?.avatar || supabaseUser.user_metadata?.avatar_url,
    createdAt: supabaseUser.created_at,
    updatedAt: profile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at
  };
};

export const authService = {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message || 'Erro ao fazer login');
    }

    if (!data.user || !data.session) {
      throw new Error('Erro ao autenticar usuário');
    }

    // Buscar perfil do usuário na tabela users
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const user = mapSupabaseUser(data.user, profile);

    return {
      user,
      token: data.session.access_token
    };
  },

  // Registro
  async register(data: RegisterFormData): Promise<AuthResponse> {
    const { confirmPassword, firstName, lastName, acceptTerms, ...rest } = data;

    // Validar se as senhas coincidem
    if (data.password !== confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    if (!acceptTerms) {
      throw new Error('Você deve aceitar os termos de uso');
    }

    const fullName = `${firstName} ${lastName}`;

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: rest.email,
        password: rest.password,
        options: {
          data: {
            name: fullName,
            full_name: fullName
          }
        }
      });

      if (authError) {
        throw new Error(authError.message || 'Erro ao criar conta');
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Se não há sessão, significa que precisa de confirmação de email
      if (!authData.session) {
        throw new Error('Conta criada! Verifique seu email para confirmar a conta.');
      }

      // O perfil será criado automaticamente via trigger no banco
      // Aguardar um momento para o trigger executar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Buscar o perfil criado
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.warn('Perfil não encontrado, usando dados do auth:', profileError.message);
      }

      const user = mapSupabaseUser(authData.user, profile);

      return {
        user,
        token: authData.session.access_token
      };
    } catch (error: any) {
      // Melhorar mensagens de erro para o usuário
      if (error.message?.includes('email')) {
        throw new Error('Este email já está em uso');
      }
      if (error.message?.includes('password')) {
        throw new Error('Senha muito fraca. Use pelo menos 6 caracteres');
      }
      throw new Error(error.message || 'Erro ao criar conta');
    }
  },

  // Obter perfil do usuário
  async getProfile(): Promise<User> {
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar perfil completo na tabela users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError) {
      // Se não encontrar na tabela users, usar dados do auth
      return mapSupabaseUser(supabaseUser);
    }

    return mapSupabaseUser(supabaseUser, profile);
  },

  // Atualizar perfil
  async updateProfile(data: Partial<User>): Promise<User> {
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      throw new Error('Usuário não autenticado');
    }

    // Atualizar na tabela users
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.avatar) updateData.avatar = data.avatar;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', supabaseUser.id)
      .select()
      .single();

    if (updateError) {
      throw new Error('Erro ao atualizar perfil');
    }

    // Também atualizar metadados do auth se necessário
    if (data.name) {
      await supabase.auth.updateUser({
        data: { name: data.name, full_name: data.name }
      });
    }

    return mapSupabaseUser(supabaseUser, updatedProfile);
  },

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Primeiro verificar a senha atual fazendo um novo login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar senha atual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    });

    if (signInError) {
      throw new Error('Senha atual incorreta');
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw new Error('Erro ao alterar senha');
    }
  },

  // Verificar se o usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  // Obter token
  async getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  },

  // Logout
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Erro ao fazer logout');
    }
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await this.getProfile();
          callback(profile);
        } catch (error) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};
