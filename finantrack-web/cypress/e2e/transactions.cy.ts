describe('Transactions Management', () => {
  beforeEach(() => {
    // Simular usuário logado
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-jwt-token');
      // Usar um ID único para o usuário de teste
      const testEmail = 'test@example.com';
      const uniqueId = `user_${testEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      win.localStorage.setItem('user', JSON.stringify({
        id: uniqueId,
        name: 'Test User',
        email: testEmail,
      }));
    });

    // Mock das APIs necessárias
    cy.intercept('GET', '/api/categories', {
      statusCode: 200,
      body: [
        {
          id: '1',
          name: 'Alimentação',
          color: '#FF0000',
          type: 'EXPENSE',
        },
        {
          id: '2',
          name: 'Salário',
          color: '#00FF00',
          type: 'INCOME',
        },
      ],
    }).as('getCategories');

    cy.intercept('GET', '/api/transactions*', {
      statusCode: 200,
      body: {
        transactions: [
          {
            id: '1',
            description: 'Supermercado',
            amount: 150.50,
            type: 'EXPENSE',
            date: '2024-01-15',
            categoryId: '1',
            category: {
              id: '1',
              name: 'Alimentação',
              color: '#FF0000',
            },
          },
          {
            id: '2',
            description: 'Salário Janeiro',
            amount: 5000.00,
            type: 'INCOME',
            date: '2024-01-01',
            categoryId: '2',
            category: {
              id: '2',
              name: 'Salário',
              color: '#00FF00',
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      },
    }).as('getTransactions');
  });

  describe('Transactions List', () => {
    it('should display transactions list', () => {
      cy.visit('/transactions');
      
      cy.wait('@getTransactions');
      
      cy.get('[data-testid="transactions-list"]').should('be.visible');
      cy.get('[data-testid="transaction-item"]').should('have.length', 2);
      
      // Verificar se as transações são exibidas corretamente
      cy.get('[data-testid="transaction-item"]').first().within(() => {
        cy.contains('Supermercado');
        cy.contains('R$ 150,50');
        cy.contains('Alimentação');
      });
    });

    it('should filter transactions by type', () => {
      cy.visit('/transactions');
      cy.wait('@getTransactions');
      
      // Filtrar por receitas
      cy.get('[data-testid="type-filter"]').select('INCOME');
      cy.get('[data-testid="apply-filters"]').click();
      
      cy.get('[data-testid="transaction-item"]').should('have.length', 1);
      cy.contains('Salário Janeiro');
    });

    it('should search transactions', () => {
      cy.visit('/transactions');
      cy.wait('@getTransactions');
      
      cy.get('[data-testid="search-input"]').type('Supermercado');
      cy.get('[data-testid="apply-filters"]').click();
      
      cy.get('[data-testid="transaction-item"]').should('have.length', 1);
      cy.contains('Supermercado');
    });
  });

  describe('Create Transaction', () => {
    it('should open create transaction modal', () => {
      cy.visit('/transactions');
      
      cy.get('[data-testid="new-transaction-button"]').click();
      cy.get('[data-testid="transaction-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Nova Transação');
    });

    it('should create expense transaction successfully', () => {
      cy.visit('/transactions');
      
      cy.intercept('POST', '/api/transactions', {
        statusCode: 201,
        body: {
          id: '3',
          description: 'Restaurante',
          amount: 75.00,
          type: 'EXPENSE',
          date: '2024-01-16',
          categoryId: '1',
        },
      }).as('createTransaction');
      
      cy.get('[data-testid="new-transaction-button"]').click();
      
      // Preencher formulário
      cy.get('input[name="description"]').type('Restaurante');
      cy.get('input[name="amount"]').type('75.00');
      cy.get('input[name="date"]').type('2024-01-16');
      cy.get('select[name="categoryId"]').select('1');
      cy.get('textarea[name="notes"]').type('Almoço de negócios');
      
      cy.get('[data-testid="submit-button"]').click();
      
      cy.wait('@createTransaction');
      cy.get('[data-testid="transaction-modal"]').should('not.exist');
      cy.get('[data-testid="success-toast"]').should('contain', 'Transação criada com sucesso');
    });

    it('should create income transaction successfully', () => {
      cy.visit('/transactions');
      
      cy.intercept('POST', '/api/transactions', {
        statusCode: 201,
        body: {
          id: '4',
          description: 'Freelance',
          amount: 1500.00,
          type: 'INCOME',
          date: '2024-01-16',
          categoryId: '2',
        },
      }).as('createTransaction');
      
      cy.get('[data-testid="new-transaction-button"]').click();
      
      // Selecionar tipo receita
      cy.get('input[value="INCOME"]').click();
      
      // Preencher formulário
      cy.get('input[name="description"]').type('Freelance');
      cy.get('input[name="amount"]').type('1500.00');
      cy.get('input[name="date"]').type('2024-01-16');
      cy.get('select[name="categoryId"]').select('2');
      
      cy.get('[data-testid="submit-button"]').click();
      
      cy.wait('@createTransaction');
      cy.get('[data-testid="success-toast"]').should('contain', 'Transação criada com sucesso');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/transactions');
      
      cy.get('[data-testid="new-transaction-button"]').click();
      cy.get('[data-testid="submit-button"]').click();
      
      cy.get('[data-testid="description-error"]').should('contain', 'Descrição é obrigatória');
      cy.get('[data-testid="amount-error"]').should('contain', 'Valor é obrigatório');
      cy.get('[data-testid="date-error"]').should('contain', 'Data é obrigatória');
      cy.get('[data-testid="categoryId-error"]').should('contain', 'Categoria é obrigatória');
    });
  });

  describe('Edit Transaction', () => {
    it('should open edit transaction modal', () => {
      cy.visit('/transactions');
      cy.wait('@getTransactions');
      
      cy.get('[data-testid="transaction-item"]').first().within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });
      
      cy.get('[data-testid="transaction-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Editar Transação');
      
      // Verificar se os campos estão preenchidos
      cy.get('input[name="description"]').should('have.value', 'Supermercado');
      cy.get('input[name="amount"]').should('have.value', '150.5');
    });

    it('should update transaction successfully', () => {
      cy.visit('/transactions');
      cy.wait('@getTransactions');
      
      cy.intercept('PUT', '/api/transactions/1', {
        statusCode: 200,
        body: {
          id: '1',
          description: 'Supermercado Atualizado',
          amount: 200.00,
          type: 'EXPENSE',
          date: '2024-01-15',
          categoryId: '1',
        },
      }).as('updateTransaction');
      
      cy.get('[data-testid="transaction-item"]').first().within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });
      
      cy.get('input[name="description"]').clear().type('Supermercado Atualizado');
      cy.get('input[name="amount"]').clear().type('200.00');
      
      cy.get('[data-testid="submit-button"]').click();
      
      cy.wait('@updateTransaction');
      cy.get('[data-testid="success-toast"]').should('contain', 'Transação atualizada com sucesso');
    });
  });

  describe('Delete Transaction', () => {
    it('should delete transaction successfully', () => {
      cy.visit('/transactions');
      cy.wait('@getTransactions');
      
      cy.intercept('DELETE', '/api/transactions/1', {
        statusCode: 200,
      }).as('deleteTransaction');
      
      cy.get('[data-testid="transaction-item"]').first().within(() => {
        cy.get('[data-testid="delete-button"]').click();
      });
      
      // Confirmar exclusão
      cy.get('[data-testid="confirm-delete"]').click();
      
      cy.wait('@deleteTransaction');
      cy.get('[data-testid="success-toast"]').should('contain', 'Transação excluída com sucesso');
    });

    it('should cancel delete operation', () => {
      cy.visit('/transactions');
      cy.wait('@getTransactions');
      
      cy.get('[data-testid="transaction-item"]').first().within(() => {
        cy.get('[data-testid="delete-button"]').click();
      });
      
      // Cancelar exclusão
      cy.get('[data-testid="cancel-delete"]').click();
      
      // Verificar que a transação ainda existe
      cy.get('[data-testid="transaction-item"]').should('have.length', 2);
    });
  });

  describe('Responsive Design', () => {
    it('should work correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/transactions');
      cy.wait('@getTransactions');
      
      // Verificar se a lista é exibida corretamente em mobile
      cy.get('[data-testid="transactions-list"]').should('be.visible');
      cy.get('[data-testid="new-transaction-button"]').should('be.visible');
      
      // Verificar se o modal funciona em mobile
      cy.get('[data-testid="new-transaction-button"]').click();
      cy.get('[data-testid="transaction-modal"]').should('be.visible');
    });
  });
});
