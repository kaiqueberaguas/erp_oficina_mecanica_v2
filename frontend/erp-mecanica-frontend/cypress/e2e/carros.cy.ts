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
    // A busca tem debounce: espera a lista filtrar para a linha do veículo antes de agir sobre ela.
    cy.contains('tr', 'Uno Way').should('contain', nomeCliente);
    cy.get('tbody tr').should('have.length', 1);

    cy.get('[aria-label^="Editar veículo"]').click();
    cy.get('#v-dono').type('{esc}');
    cy.get('#v-modelo').clear().type('Uno Mille');
    cy.contains('button', 'Salvar Veículo').click();
    cy.contains('tr', 'Uno Mille').should('be.visible');

    cy.get('[aria-label^="Excluir veículo"]').click();
    cy.get('[role=alertdialog]')
      .contains('button', /Excluir/)
      .click();
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
    // O combobox abre a lista ao receber o foco e ela cobriria os demais campos.
    cy.get('#v-dono').type('{esc}');
    cy.get('#v-marca').type('Fiat');
    cy.get('#v-modelo').type('Uno');
    cy.get('#v-placa').type(placaAleatoria());
    cy.contains('button', 'Salvar Veículo').click();
    cy.get('#v-dono').should('have.class', 'border-rose-600');
  });
});
