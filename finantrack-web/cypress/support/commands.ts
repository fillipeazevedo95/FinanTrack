/// <reference types="cypress" />

// Custom commands for FinanTrack application

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with email and password
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Login with mock user data
       */
      loginWithMockUser(): Chainable<void>;
      
      /**
       * Create a mock transaction
       */
      createMockTransaction(transaction: Partial<Transaction>): Chainable<void>;
      
      /**
       * Create a mock category
       */
      createMockCategory(category: Partial<Category>): Chainable<void>;
      
      /**
       * Wait for page to load completely
       */
      waitForPageLoad(): Chainable<void>;
      
      /**
       * Check if element is in viewport
       */
      isInViewport(): Chainable<void>;
      
      /**
       * Drag and drop element
       */
      dragAndDrop(targetSelector: string): Chainable<void>;
    }
  }
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// Login with mock user
Cypress.Commands.add('loginWithMockUser', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'mock-jwt-token');
    // Usar um ID único para o usuário de teste
    const testEmail = 'test@example.com';
    const uniqueId = `user_${testEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    win.localStorage.setItem('user', JSON.stringify({
      id: uniqueId,
      name: 'Test User',
      email: testEmail,
      avatar: null,
    }));
  });
});

// Create mock transaction
Cypress.Commands.add('createMockTransaction', (transaction: Partial<Transaction>) => {
  const defaultTransaction: Transaction = {
    id: '1',
    description: 'Test Transaction',
    amount: 100,
    type: 'EXPENSE',
    date: '2024-01-01',
    categoryId: '1',
    notes: '',
    ...transaction,
  };

  cy.intercept('POST', '/api/transactions', {
    statusCode: 201,
    body: defaultTransaction,
  }).as('createTransaction');
});

// Create mock category
Cypress.Commands.add('createMockCategory', (category: Partial<Category>) => {
  const defaultCategory: Category = {
    id: '1',
    name: 'Test Category',
    description: 'Test Description',
    color: '#FF0000',
    type: 'EXPENSE',
    ...category,
  };

  cy.intercept('POST', '/api/categories', {
    statusCode: 201,
    body: defaultCategory,
  }).as('createCategory');
});

// Wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document');
  cy.document().should('have.property', 'readyState', 'complete');
});

// Check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('be.visible');
  cy.window().then((win) => {
    const element = subject[0];
    const rect = element.getBoundingClientRect();
    
    expect(rect.top).to.be.at.least(0);
    expect(rect.left).to.be.at.least(0);
    expect(rect.bottom).to.be.at.most(win.innerHeight);
    expect(rect.right).to.be.at.most(win.innerWidth);
  });
});

// Drag and drop
Cypress.Commands.add('dragAndDrop', { prevSubject: true }, (subject, targetSelector) => {
  cy.wrap(subject).trigger('mousedown', { button: 0 });
  cy.get(targetSelector).trigger('mousemove').trigger('mouseup');
});

// Custom assertions
Cypress.Commands.add('shouldHaveToast', (message: string, type: 'success' | 'error' = 'success') => {
  cy.get(`[data-testid="${type}-toast"]`).should('contain', message);
});

// API mocking helpers
Cypress.Commands.add('mockApiError', (endpoint: string, statusCode: number = 500, message: string = 'Internal Server Error') => {
  cy.intercept('*', endpoint, {
    statusCode,
    body: { message },
  });
});

// Form helpers
Cypress.Commands.add('fillTransactionForm', (data: Partial<Transaction>) => {
  if (data.description) {
    cy.get('input[name="description"]').clear().type(data.description);
  }
  if (data.amount) {
    cy.get('input[name="amount"]').clear().type(data.amount.toString());
  }
  if (data.date) {
    cy.get('input[name="date"]').clear().type(data.date);
  }
  if (data.categoryId) {
    cy.get('select[name="categoryId"]').select(data.categoryId);
  }
  if (data.notes) {
    cy.get('textarea[name="notes"]').clear().type(data.notes);
  }
  if (data.type) {
    cy.get(`input[value="${data.type}"]`).click();
  }
});

Cypress.Commands.add('fillCategoryForm', (data: Partial<Category>) => {
  if (data.name) {
    cy.get('input[name="name"]').clear().type(data.name);
  }
  if (data.description) {
    cy.get('input[name="description"]').clear().type(data.description);
  }
  if (data.color) {
    cy.get(`input[value="${data.color}"]`).click();
  }
  if (data.type) {
    cy.get('select[name="type"]').select(data.type);
  }
});

// Accessibility helpers
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Mobile helpers
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport('iphone-x');
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport('ipad-2');
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720);
});

// Wait for animations
Cypress.Commands.add('waitForAnimation', () => {
  cy.wait(300); // Wait for CSS transitions
});

// Screenshot helpers
Cypress.Commands.add('takeScreenshot', (name: string) => {
  cy.screenshot(name, { capture: 'viewport' });
});

// Local storage helpers
Cypress.Commands.add('clearAppData', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Network helpers
Cypress.Commands.add('waitForNetworkIdle', () => {
  cy.intercept('**', (req) => {
    req.reply((res) => {
      // Add a small delay to ensure network is idle
      return new Promise((resolve) => {
        setTimeout(() => resolve(res), 100);
      });
    });
  });
});
