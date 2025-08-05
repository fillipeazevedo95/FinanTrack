import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Configurações do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl ? 'Definida' : 'Não definida',
  key: supabaseAnonKey ? 'Definida' : 'Não definida'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas:', {
    REACT_APP_SUPABASE_URL: supabaseUrl,
    REACT_APP_SUPABASE_ANON_KEY: supabaseAnonKey ? '[HIDDEN]' : undefined
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Criar cliente Supabase com tipagem
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper para verificar se o usuário está autenticado
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export default supabase;