import { criarClienteApi, entrarComoAdmin, placaAleatoria } from '../support/api';
import type { Sessao } from '../support/api';

describe('Veículos', () => {
  let nomeCliente: string;

  beforeEach(() => {
    entrarComoAdmin();
    nomeCliente = `Dono E2E ${Date.now()}`;
    cy.get<Sessao>('@sessao').then((s) => criarClienteApi(s.token, nomeCliente));
    cy.visit('/carros');
  });

  const escolherCliente = () => {
    cy.get('#v-dono').type(nomeCliente);
    cy.get('[role=option]').contains(nomeCliente).click();
  };

  it('cadastra, busca, edita e exclui um veículo', () => {
    const placa = placaAleatoria();

    cy.contains('button', 'Novo Veículo').click();
    escolherCliente();
    cy.get('#v-marca').type('Fiat');
    cy.get('#v-modelo').type('Uno Way');
    cy.get('#v-placa').type(placa);
    cy.contains('button', 'Salvar Veículo').click();

    cy.get('#busca-car').type(placa);
    cy.contains('tr', 'Uno Way').should('contain', nomeCliente);

    cy.get('[aria-label^="Editar veículo"]').click();
    cy.get('#v-modelo').clear().type('Uno Mille');
    cy.contains('button', 'Salvar Veículo').click();
    cy.contains('tr', 'Uno Mille').should('be.visible');

    cy.get('[aria-label^="Excluir veículo"]').click();
    cy.get('[role=alertdialog]').contains('button', /Excluir/).click();
    cy.contains('tr', 'Uno Mille').should('not.exist');
  });

  it('rejeita placa inválida', () => {
    cy.contains('button', 'Novo Veículo').click();
    escolherCliente();
    cy.get('#v-marca').type('Fiat');
    cy.get('#v-modelo').type('Uno');
    cy.get('#v-placa').type('12');
    cy.contains('button', 'Salvar Veículo').click();
    cy.get('#v-placa').should('have.class', 'border-rose-600');
  });

  it('exige selecionar o cliente', () => {
    cy.contains('button', 'Novo Veículo').click();
    cy.get('#v-marca').type('Fiat');
    cy.get('#v-modelo').type('Uno');
    cy.get('#v-placa').type(placaAleatoria());
    cy.contains('button', 'Salvar Veículo').click();
    cy.get('#v-dono').should('have.class', 'border-rose-600');
  });
});
