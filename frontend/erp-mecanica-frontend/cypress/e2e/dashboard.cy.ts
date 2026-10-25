import type { Sessao } from '../support/api';
import { criarCarroApi, criarClienteApi, criarOrdemApi, entrarComoAdmin } from '../support/api';

describe('Dashboard', () => {
  beforeEach(() => {
    entrarComoAdmin();
    // Com o banco sem ordens a tela esconde os gráficos; garante ao menos uma OS.
    cy.get<Sessao>('@sessao').then((s) =>
      criarClienteApi(s.token, `Dono E2E ${Date.now()}`).then((c) =>
        criarCarroApi(s.token, c.id).then((car) => criarOrdemApi(s.token, car.id)),
      ),
    );
  });

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
