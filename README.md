# 💰 FinanTrack - Sistema de Controle Financeiro

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Prisma-5.x-indigo?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
</div>

<div align="center">
  <h3>Sistema completo de controle financeiro pessoal com interface moderna e responsiva</h3>
  <p>Gerencie suas receitas, despesas, categorias e visualize relatórios detalhados</p>
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

### � **Segurança e UX**
- 🔒 **Autenticação JWT** - Login seguro com refresh tokens
- 👤 **Gestão de Usuários** - Perfis individuais protegidos
- 🛡️ **Validações** - Frontend (React Hook Form) e backend
- 🔐 **Rotas Protegidas** - Acesso controlado por autenticação
- ♿ **Acessibilidade** - Suporte a leitores de tela
- 🌙 **Preparado para Dark Mode** - Estrutura para tema escuro

## 🛠️ Tecnologias

### Frontend
- React.js
- TypeScript
- HTML5
- CSS3 (Flexbox)

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM

### Banco de Dados
- PostgreSQL (via Railway/Supabase)

### Autenticação
- bcrypt
- JWT

### Deploy
- **Frontend**: Vercel
- **Backend**: Railway ou Supabase

## 📁 Estrutura do Projeto

```
/
├── finantrack-api/          # Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   └── middlewares/
│   ├── prisma/
│   ├── .env
│   └── server.ts
│
└── finantrack-web/          # Frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── hooks/
    │   └── utils/
    ├── public/
    └── package.json
```

## 🚀 Como executar

### Backend
```bash
cd finantrack-api
npm install
npm run dev
```

### Frontend
```bash
cd finantrack-web
npm install
npm start
```

## 📝 Licença

Este projeto está sob a licença MIT.
