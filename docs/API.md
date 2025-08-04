# 📚 Documentação da API - FinanTrack

## 🔗 Base URL
```
Desenvolvimento: http://localhost:3001/api
Produção: https://finantrack-api.railway.app/api
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```http
Authorization: Bearer <seu-jwt-token>
```

---

## 📋 Endpoints

### 🔐 **Autenticação**

#### Registrar Usuário
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@exemplo.com"
  },
  "token": "jwt-token"
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "token": "novo-jwt-token"
}
```

---

### 👤 **Usuários**

#### Obter Perfil
```http
GET /users/profile
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "avatar": "url-da-imagem",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Atualizar Perfil
```http
PUT /users/profile
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "João Silva Santos",
  "avatar": "nova-url-da-imagem"
}
```

---

### 🏷️ **Categorias**

#### Listar Categorias
```http
GET /categories
```

**Query Parameters:**
- `type` (opcional): `INCOME` ou `EXPENSE`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Alimentação",
    "description": "Gastos com alimentação",
    "color": "#FF5722",
    "type": "EXPENSE",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Criar Categoria
```http
POST /categories
```

**Body:**
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da categoria",
  "color": "#2196F3",
  "type": "EXPENSE"
}
```

#### Atualizar Categoria
```http
PUT /categories/:id
```

**Body:**
```json
{
  "name": "Categoria Atualizada",
  "description": "Nova descrição",
  "color": "#4CAF50"
}
```

#### Deletar Categoria
```http
DELETE /categories/:id
```

**Response (200):**
```json
{
  "message": "Categoria deletada com sucesso"
}
```

---

### 💰 **Transações**

#### Listar Transações
```http
GET /transactions
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `type` (opcional): `INCOME` ou `EXPENSE`
- `categoryId` (opcional): ID da categoria
- `startDate` (opcional): Data inicial (YYYY-MM-DD)
- `endDate` (opcional): Data final (YYYY-MM-DD)
- `search` (opcional): Busca na descrição

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "description": "Supermercado",
      "amount": 150.50,
      "type": "EXPENSE",
      "date": "2024-01-15",
      "categoryId": "uuid",
      "userId": "uuid",
      "notes": "Compras da semana",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "category": {
        "id": "uuid",
        "name": "Alimentação",
        "color": "#FF5722"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Criar Transação
```http
POST /transactions
```

**Body:**
```json
{
  "description": "Salário Janeiro",
  "amount": 5000.00,
  "type": "INCOME",
  "date": "2024-01-01",
  "categoryId": "uuid",
  "notes": "Salário do mês"
}
```

#### Atualizar Transação
```http
PUT /transactions/:id
```

**Body:**
```json
{
  "description": "Descrição atualizada",
  "amount": 200.00,
  "notes": "Novas observações"
}
```

#### Deletar Transação
```http
DELETE /transactions/:id
```

---

### 📊 **Relatórios**

#### Dashboard
```http
GET /reports/dashboard
```

**Query Parameters:**
- `month` (opcional): Mês (1-12)
- `year` (opcional): Ano (YYYY)

**Response (200):**
```json
{
  "currentBalance": 2500.00,
  "monthlyIncome": 6000.00,
  "monthlyExpense": 3500.00,
  "transactionCount": 45,
  "period": {
    "month": 1,
    "year": 2024
  },
  "recentTransactions": [...]
}
```

#### Relatório Mensal
```http
GET /reports/monthly
```

**Query Parameters:**
- `month` (opcional): Mês (1-12)
- `year` (opcional): Ano (YYYY)

**Response (200):**
```json
{
  "month": 1,
  "year": 2024,
  "totalIncome": 6000.00,
  "totalExpense": 3500.00,
  "balance": 2500.00,
  "transactionCount": 45,
  "categories": [
    {
      "id": "uuid",
      "name": "Alimentação",
      "color": "#FF5722",
      "type": "EXPENSE",
      "total": 800.00,
      "percentage": 22.86,
      "transactionCount": 12
    }
  ],
  "monthlyGoal": {
    "income": 6000.00,
    "expense": 4000.00
  }
}
```

---

## 🚨 **Códigos de Erro**

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito de dados |
| 422 | Unprocessable Entity - Validação falhou |
| 500 | Internal Server Error - Erro interno |

**Formato de Erro:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Dados inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email é obrigatório"
    }
  ]
}
```

---

## 📝 **Notas**

- Todas as datas estão no formato ISO 8601 (UTC)
- Valores monetários são em formato decimal (ex: 150.50)
- Paginação padrão: 10 itens por página
- Rate limiting: 100 requests por minuto por IP
- Todas as rotas (exceto auth) requerem autenticação
