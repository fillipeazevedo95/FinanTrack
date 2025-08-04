describe('Authentication Flow', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    cy.clearLocalStorage();
  });

  describe('Login Page', () => {
    it('should display login form', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Entrar');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      
      cy.get('button[type="submit"]').click();
      
      cy.get('[data-testid="email-error"]').should('contain', 'Email é obrigatório');
      cy.get('[data-testid="password-error"]').should('contain', 'Senha é obrigatória');
    });

    it('should show error for invalid email format', () => {
      cy.visit('/login');
      
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.get('[data-testid="email-error"]').should('contain', 'Email inválido');
    });

    it('should login successfully with valid credentials', () => {
      cy.visit('/login');
      
      // Mock da API de login
      // Usar um ID único para o usuário de teste
      const testEmail = 'test@example.com';
      const uniqueId = `user_${testEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: uniqueId,
            name: 'Test User',
            email: testEmail,
          },
          token: 'mock-jwt-token',
        },
      }).as('loginRequest');
      
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@loginRequest');
      cy.url().should('include', '/dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          message: 'Credenciais inválidas',
        },
      }).as('loginRequest');
      
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@loginRequest');
      cy.get('[data-testid="error-message"]').should('contain', 'Credenciais inválidas');
    });

    it('should navigate to register page', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="register-link"]').click();
      cy.url().should('include', '/register');
    });
  });

  describe('Register Page', () => {
    it('should display register form', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Criar conta');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/register');
      
      cy.get('button[type="submit"]').click();
      
      cy.get('[data-testid="name-error"]').should('contain', 'Nome é obrigatório');
      cy.get('[data-testid="email-error"]').should('contain', 'Email é obrigatório');
      cy.get('[data-testid="password-error"]').should('contain', 'Senha é obrigatória');
    });

    it('should show error for password mismatch', () => {
      cy.visit('/register');
      
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('differentpassword');
      cy.get('button[type="submit"]').click();
      
      cy.get('[data-testid="confirmPassword-error"]').should('contain', 'Senhas não coincidem');
    });

    it('should register successfully with valid data', () => {
      cy.visit('/register');
      
      // Usar um ID único para o usuário de teste
      const testEmail = 'test@example.com';
      const uniqueId = `user_${testEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: {
            id: uniqueId,
            name: 'Test User',
            email: testEmail,
          },
          token: 'mock-jwt-token',
        },
      }).as('registerRequest');
      
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@registerRequest');
      cy.url().should('include', '/dashboard');
    });

    it('should navigate to login page', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="login-link"]').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });

    it('should allow access to protected routes when authenticated', () => {
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
      
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Simular usuário logado
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        }));
      });
    });

    it('should logout successfully', () => {
      cy.visit('/dashboard');
      
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });
});
