import { entrarComoAdmin } from '../support/api';

describe('Dashboard', () => {
  beforeEach(() => entrarComoAdmin());

  it('carrega os indicadores e os gráficos após o login', () => {
    cy.intercept('GET', '**/api/v1/dashboard').as('dashboard');
    cy.visit('/dashboard');
    cy.wait('@dashboard').its('response.statusCode').should('eq', 200);

    cy.contains('h1', 'Visão Geral da Oficina');
    cy.contains('Faturamento Total').should('be.visible');
    cy.contains('Ticket Médio').should('be.visible');
    cy.contains('Lead Time Médio').should('be.visible');
    cy.contains('Total de Ordens').should('be.visible');
    cy.contains('h2', 'Distribuição por Status').should('be.visible');
    cy.contains('h2', 'Top 5 Marcas Atendidas').should('be.visible');
  });
});
