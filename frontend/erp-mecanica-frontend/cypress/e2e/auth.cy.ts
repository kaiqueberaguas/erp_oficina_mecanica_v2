import { ADMIN, API } from '../support/e2e';

describe('Cadastro', () => {
  it('cadastra um novo usuário e redireciona para o login', () => {
    const login = `e2e-${Date.now()}`;
    cy.visit('/cadastro');
    cy.get('#nome').type('Usuário E2E');
    cy.get('#login').type(login);
    cy.get('#senha').type('Senha@123');
    cy.get('#confirmarSenha').type('Senha@123');
    cy.contains('button', 'Cadastrar').click();

    cy.location('pathname').should('eq', '/login');

    // O usuário criado consegue autenticar.
    cy.get('#login').type(login);
    cy.get('#senha').type('Senha@123');
    cy.contains('button', 'Entrar').click();
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('mostra erro quando as senhas não conferem', () => {
    cy.visit('/cadastro');
    cy.get('#senha').type('Senha@123');
    cy.get('#confirmarSenha').type('outra-senha').blur();
    cy.contains('As senhas não conferem.').should('be.visible');
    cy.location('pathname').should('eq', '/cadastro');
  });

  it('mostra erro ao cadastrar login já existente', () => {
    cy.visit('/cadastro');
    cy.get('#nome').type('Duplicado');
    cy.get('#login').type(ADMIN.login);
    cy.get('#senha').type('Senha@123');
    cy.get('#confirmarSenha').type('Senha@123');
    cy.contains('button', 'Cadastrar').click();
    cy.get('[data-testid=erro-cadastro]').should('be.visible');
    cy.location('pathname').should('eq', '/cadastro');
  });
});

describe('Login', () => {
  it('autentica com credenciais válidas e abre o dashboard', () => {
    cy.visit('/login');
    cy.get('#login').type(ADMIN.login);
    cy.get('#senha').type(ADMIN.senha);
    cy.contains('button', 'Entrar').click();

    cy.location('pathname').should('eq', '/dashboard');
    cy.get('[data-testid=usuario-logado]').should('contain', ADMIN.login);
    cy.window().its('sessionStorage').invoke('getItem', 'erp.token').should('not.be.null');
  });

  it('mostra mensagem de erro com senha inválida', () => {
    cy.visit('/login');
    cy.get('#login').type(ADMIN.login);
    cy.get('#senha').type('senha-errada');
    cy.contains('button', 'Entrar').click();

    cy.get('[data-testid=erro-login]').should('be.visible');
    cy.location('pathname').should('eq', '/login');
  });

  it('mantém a sessão ao recarregar a página (F5)', () => {
    cy.visit('/login');
    cy.get('#login').type(ADMIN.login);
    cy.get('#senha').type(ADMIN.senha);
    cy.contains('button', 'Entrar').click();
    cy.location('pathname').should('eq', '/dashboard');

    cy.reload();
    cy.location('pathname').should('eq', '/dashboard');
    cy.get('[data-testid=usuario-logado]').should('be.visible');
  });

  it('logout encerra a sessão e bloqueia rotas privadas', () => {
    cy.request('POST', `${API}/auth/login`, ADMIN).then(({ body }) => {
      cy.visit('/dashboard', {
        onBeforeLoad(win) {
          win.sessionStorage.setItem('erp.token', body.token);
          win.sessionStorage.setItem('erp.usuario', JSON.stringify(body.usuario));
          win.sessionStorage.setItem('erp.expiraEm', body.expiraEm);
        },
      });
    });
    cy.contains('button', 'Sair').click();
    cy.location('pathname').should('eq', '/login');

    cy.visit('/clientes');
    cy.location('pathname').should('eq', '/login');
  });

  it('redireciona visitante não logado para o login', () => {
    cy.visit('/dashboard');
    cy.location('pathname').should('eq', '/login');
  });
});
