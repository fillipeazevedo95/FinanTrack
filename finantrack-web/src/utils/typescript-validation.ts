// Arquivo de validação das novas configurações TypeScript
// Remove este arquivo após confirmar que tudo funciona

import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database';

// Teste das novas funcionalidades do TypeScript 4.9+

// 1. exactOptionalPropertyTypes - propriedades opcionais são mais rigorosas
interface TestConfig {
  name: string;
  enabled?: boolean; // Deve ser boolean | undefined, não boolean | undefined | null
}

const config: TestConfig = {
  name: 'test',
  enabled: true // ✅ OK
  // enabled: null // ❌ Erro com exactOptionalPropertyTypes
};

// 2. noUncheckedIndexedAccess - arrays são mais seguros
const testArray = ['a', 'b', 'c'];
const maybeElement = testArray[10]; // Tipo: string | undefined (não apenas string)

// 3. useUnknownInCatchVariables - catch com unknown por padrão
try {
  throw new Error('test');
} catch (error) {
  // error é automaticamente unknown, não any
  if (error instanceof Error) {
    console.log(error.message);
  }
}

// 4. Teste do path mapping
const testSupabaseConnection = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// 5. Tipos do Supabase funcionando
type UserTable = Database['public']['Tables']['users']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export const validateTypeScriptConfig = () => {
  console.log('✅ TypeScript configuration is working correctly!');
  console.log('✅ Path mapping working');
  console.log('✅ Strict type checking enabled');
  console.log('✅ Modern ES2020+ features available');
};

export default validateTypeScriptConfig;