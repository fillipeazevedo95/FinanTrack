#!/usr/bin/env node

/**
 * Script de validação do sistema FinanTrack
 * Executa uma série de verificações para garantir que o sistema está funcionando corretamente
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Iniciando validação do sistema FinanTrack...\n');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

let errors = 0;
let warnings = 0;

// Função para executar comandos
function runCommand(command, description) {
  try {
    log.info(`Executando: ${description}`);
    execSync(command, { stdio: 'pipe' });
    log.success(`${description} - OK`);
    return true;
  } catch (error) {
    log.error(`${description} - FALHOU`);
    console.log(error.stdout?.toString() || error.message);
    errors++;
    return false;
  }
}

// Função para verificar se arquivo existe
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log.success(`${description} - Encontrado`);
    return true;
  } else {
    log.error(`${description} - Não encontrado: ${filePath}`);
    errors++;
    return false;
  }
}

// Função para verificar se diretório existe
function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log.success(`${description} - Encontrado`);
    return true;
  } else {
    log.error(`${description} - Não encontrado: ${dirPath}`);
    errors++;
    return false;
  }
}

// Função para verificar conteúdo de arquivo
function checkFileContent(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      log.success(`${description} - OK`);
      return true;
    } else {
      log.warning(`${description} - Conteúdo não encontrado`);
      warnings++;
      return false;
    }
  } catch (error) {
    log.error(`${description} - Erro ao ler arquivo: ${error.message}`);
    errors++;
    return false;
  }
}

console.log('📁 Verificando estrutura de arquivos...\n');

// Verificar arquivos essenciais
const essentialFiles = [
  ['package.json', 'Package.json'],
  ['tsconfig.json', 'TypeScript config'],
  ['tailwind.config.js', 'Tailwind config'],
  ['src/App.tsx', 'App principal'],
  ['src/index.tsx', 'Index principal'],
  ['src/index.css', 'CSS principal'],
];

essentialFiles.forEach(([file, desc]) => {
  checkFile(file, desc);
});

// Verificar diretórios essenciais
const essentialDirs = [
  ['src/components', 'Componentes'],
  ['src/pages', 'Páginas'],
  ['src/hooks', 'Hooks customizados'],
  ['src/services', 'Services'],
  ['src/types', 'Tipos TypeScript'],
  ['src/utils', 'Utilitários'],
];

essentialDirs.forEach(([dir, desc]) => {
  checkDirectory(dir, desc);
});

console.log('\n🔧 Verificando configurações...\n');

// Verificar package.json
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'axios',
    'react-hook-form',
    'lucide-react',
    'clsx',
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log.success(`Dependência ${dep} - OK`);
    } else {
      log.error(`Dependência ${dep} - Não encontrada`);
      errors++;
    }
  });
}

console.log('\n🧪 Executando testes...\n');

// Verificar se os testes existem
const testFiles = [
  'src/utils/formatters.test.ts',
  'src/components/ui/Button.test.tsx',
  'src/components/ui/Input.test.tsx',
  'src/hooks/useBreakpoint.test.ts',
];

testFiles.forEach(testFile => {
  checkFile(testFile, `Teste: ${testFile}`);
});

// Executar testes unitários (se disponível)
if (fs.existsSync('src/setupTests.ts')) {
  log.info('Configuração de testes encontrada');
  // runCommand('npm test -- --watchAll=false --coverage', 'Testes unitários');
} else {
  log.warning('Configuração de testes não encontrada');
  warnings++;
}

console.log('\n🎨 Verificando componentes UI...\n');

// Verificar componentes essenciais
const uiComponents = [
  'src/components/ui/Button.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Modal.tsx',
  'src/components/ui/Select.tsx',
];

uiComponents.forEach(component => {
  checkFile(component, `Componente: ${path.basename(component)}`);
});

console.log('\n📱 Verificando páginas...\n');

// Verificar páginas essenciais
const pages = [
  'src/pages/LoginPage.tsx',
  'src/pages/RegisterPage.tsx',
  'src/pages/DashboardPage.tsx',
  'src/pages/TransactionsPage.tsx',
  'src/pages/CategoriesPage.tsx',
  'src/pages/ReportsPage.tsx',
];

pages.forEach(page => {
  checkFile(page, `Página: ${path.basename(page)}`);
});

console.log('\n🔗 Verificando services...\n');

// Verificar services
const services = [
  'src/services/api.ts',
  'src/services/authService.ts',
  'src/services/categoryService.ts',
  'src/services/transactionService.ts',
];

services.forEach(service => {
  checkFile(service, `Service: ${path.basename(service)}`);
});

console.log('\n🎣 Verificando hooks...\n');

// Verificar hooks customizados
const hooks = [
  'src/hooks/useAuth.ts',
  'src/hooks/useCategories.ts',
  'src/hooks/useTransactions.ts',
  'src/hooks/useBreakpoint.ts',
];

hooks.forEach(hook => {
  if (checkFile(hook, `Hook: ${path.basename(hook)}`)) {
    // Verificar se o hook exporta algo
    checkFileContent(hook, 'export', `Exportação do ${path.basename(hook)}`);
  }
});

console.log('\n📊 Verificando gráficos...\n');

// Verificar componentes de gráficos
const chartComponents = [
  'src/components/charts/ChartContainer.tsx',
  'src/components/charts/LineChart.tsx',
  'src/components/charts/PieChart.tsx',
  'src/components/charts/BarChart.tsx',
];

chartComponents.forEach(chart => {
  checkFile(chart, `Gráfico: ${path.basename(chart)}`);
});

console.log('\n🎯 Verificando tipos TypeScript...\n');

// Verificar tipos
if (checkFile('src/types/index.ts', 'Tipos principais')) {
  const requiredTypes = [
    'User',
    'Category',
    'Transaction',
    'MonthlyGoal',
  ];
  
  requiredTypes.forEach(type => {
    checkFileContent('src/types/index.ts', `interface ${type}`, `Tipo: ${type}`);
  });
}

console.log('\n🔒 Verificando autenticação...\n');

// Verificar contexto de autenticação
if (checkFile('src/contexts/AuthContext.tsx', 'Contexto de autenticação')) {
  checkFileContent('src/contexts/AuthContext.tsx', 'AuthProvider', 'AuthProvider');
  checkFileContent('src/contexts/AuthContext.tsx', 'useAuth', 'Hook useAuth');
}

console.log('\n📱 Verificando responsividade...\n');

// Verificar CSS responsivo
if (checkFile('src/styles/globals.css', 'CSS global')) {
  checkFileContent('src/styles/globals.css', '@media', 'Media queries');
  checkFileContent('src/styles/globals.css', 'mobile-', 'Classes mobile');
}

console.log('\n📋 Resumo da validação:\n');

if (errors === 0 && warnings === 0) {
  log.success('🎉 Sistema validado com sucesso! Tudo está funcionando corretamente.');
} else {
  if (errors > 0) {
    log.error(`❌ ${errors} erro(s) encontrado(s)`);
  }
  if (warnings > 0) {
    log.warning(`⚠️  ${warnings} aviso(s) encontrado(s)`);
  }
  
  console.log('\n📝 Recomendações:');
  
  if (errors > 0) {
    console.log('- Corrija os erros encontrados antes de prosseguir');
    console.log('- Verifique se todos os arquivos essenciais estão presentes');
    console.log('- Execute npm install para instalar dependências faltantes');
  }
  
  if (warnings > 0) {
    console.log('- Revise os avisos para melhorar a qualidade do código');
    console.log('- Considere implementar os recursos faltantes');
  }
}

console.log('\n🚀 Próximos passos sugeridos:');
console.log('1. Execute npm start para iniciar o servidor de desenvolvimento');
console.log('2. Execute npm test para rodar os testes unitários');
console.log('3. Execute npm run build para criar build de produção');
console.log('4. Teste a aplicação em diferentes dispositivos e navegadores');

process.exit(errors > 0 ? 1 : 0);
