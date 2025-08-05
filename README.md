# 💰 FinanTrack - Sistema de Controle Financeiro

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3CA55C?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<div align="center">
  <h3>Sistema completo de controle financeiro pessoal com Supabase</h3>
  <p>Frontend-only com autenticação, banco de dados e APIs serverless</p>
</div>

---

## � Funcionalidades

### 💼 **Gestão Financeira**
- ✅ **Transações** - Cadastro de receitas e despesas com validações
- ✅ **Categorias** - Organização por cores e tipos personalizáveis
- ✅ **Dashboard** - Visão geral das finanças com indicadores
- ✅ **Relatórios** - Gráficos interativos e análises detalhadas
- ✅ **Metas** - Definição de objetivos mensais
- ✅ **Filtros** - Busca e filtros avançados
- ✅ **Paginação** - Navegação eficiente entre dados

### 📊 **Visualizações**
- 📈 **Gráficos Interativos** - Chart.js com linha, pizza, barras e área
- 🎯 **Dashboard Dinâmico** - Resumos e indicadores em tempo real
- 📱 **Interface Responsiva** - Mobile-first design otimizado
- 🎨 **Design System** - Componentes consistentes e reutilizáveis
- ⚡ **Loading States** - Feedback visual durante carregamentos
- 🔔 **Notificações** - Sistema de alertas e confirmações

### 🔒 **Segurança e UX**
- 🔐 **Supabase Auth** - Autenticação segura com sessões automáticas
- 👤 **Row Level Security** - Isolamento total de dados por usuário
- 🛡️ **Validações** - Frontend (React Hook Form) + Supabase policies
- 🔐 **Rotas Protegidas** - Acesso controlado por autenticação
- ♿ **Acessibilidade** - Suporte a leitores de tela
- 🌙 **Preparado para Dark Mode** - Estrutura para tema escuro

## 🛠️ Tecnologias

### Frontend
- **React.js 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utility-first
- **React Hook Form** - Gerenciamento de formulários
- **Chart.js** - Gráficos interativos
- **Lucide React** - Ícones SVG otimizados

### Backend (Serverless)
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Isolamento de dados automático
- **Supabase Auth** - Autenticação gerenciada
- **Edge Functions** - Funções serverless (preparado)

### Ferramentas de Desenvolvimento
- **CRACO** - Configuração React otimizada
- **Jest + Testing Library** - Testes automatizados
- **Cypress** - Testes E2E
- **ESLint + Prettier** - Linting e formatação

### Deploy
- **Frontend**: Vercel, Netlify ou Supabase Hosting
- **Backend**: Supabase (gerenciado automaticamente)

## 📁 Estrutura do Projeto

```
/
├── finantrack-web/              # Aplicação Principal
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── ui/             # Design System
│   │   │   └── charts/         # Componentes de gráficos
│   │   ├── pages/              # Páginas da aplicação
│   │   ├── services/           # Integração com Supabase
│   │   ├── contexts/           # Context API (Auth, Data, Theme)
│   │   ├── types/              # Definições TypeScript
│   │   ├── utils/              # Funções utilitárias
│   │   └── config/             # Configurações (Supabase)
│   ├── public/                 # Assets estáticos
│   ├── cypress/                # Testes E2E
│   ├── .env                    # Variáveis de ambiente
│   └── package.json            # Dependências e scripts
├── supabase-schema.sql         # Schema do banco de dados
├── SUPABASE_SETUP.md          # Guia de configuração
└── README.md                   # Documentação
```

## 🚀 Configuração e Execução

### 1. **Pré-requisitos**
- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 2. **Setup Local**

#### Clone o repositório:
```bash
git clone https://github.com/fillipeazevedo95/FinanTrack.git
cd FinanTrack/finantrack-web
```

#### Instale as dependências:
```bash
npm install
```

#### Configure as variáveis de ambiente:
Copie o arquivo `.env.example` para `.env`:
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

#### Execute o projeto:
```bash
npm start
```

O aplicativo estará disponível em `http://localhost:3000`

### 3. **Comandos Disponíveis**
```bash
npm start              # Executa em modo desenvolvimento
npm run build          # Cria versão de produção
npm test               # Executa testes
npm run test:coverage  # Testes com cobertura
npm run cypress:open   # Abre testes E2E
```

### 4. **Resolução de Problemas**

#### Erro de dependências:
```bash
npm install --legacy-peer-deps
```

#### Problema com cache:
```bash
npm start -- --reset-cache
```

#### Reinstalação completa:
```bash
# Windows
rmdir /s node_modules & del package-lock.json & npm install

# macOS/Linux
rm -rf node_modules package-lock.json && npm install
```
- Git

### 2. **Configuração do Supabase**
1. Crie um projeto no Supabase
2. Execute o schema SQL (`supabase-schema.sql`) no SQL Editor
3. Copie as credenciais do projeto

### 3. **Configuração Local**
```bash
# Clone o repositório
git clone <seu-repositorio>
cd FinanTrack/finantrack-web

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

### 4. **Executar a Aplicação**
```bash
# Desenvolvimento
npm start

# Build de produção
npm run build

# Testes
npm test

# Testes E2E
npm run cypress:open
```

### 5. **Deploy**
```bash
# Build otimizado
npm run build

# Deploy no Vercel (recomendado)
vercel --prod

# Deploy no Netlify
netlify deploy --prod --dir=build
```

## 📚 Links Úteis

- 📖 **[Guia de Setup do Supabase](./SUPABASE_SETUP.md)**
- 🌐 **[Documentação do Supabase](https://supabase.com/docs)**
- ⚛️ **[Documentação do React](https://react.dev)**
- 🎨 **[Tailwind CSS](https://tailwindcss.com)**

## 🆘 Resolução de Problemas

### Erro de conexão com Supabase
- Verifique as variáveis `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY`
- Confirme que o schema SQL foi executado

### Erro no registro de usuários
- Verifique se a tabela `users` existe
- Confirme que os triggers estão ativos

### Build falha
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

## 📝 Licença

Este projeto está sob a licença MIT.
