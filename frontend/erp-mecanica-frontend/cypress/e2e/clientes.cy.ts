import { cpfAleatorio, entrarComoAdmin } from '../support/api';

describe('Clientes', () => {
  beforeEach(() => {
    entrarComoAdmin();
    cy.visit('/clientes');
  });

  it('cria, busca, edita e exclui um cliente', () => {
    const nome = `Cliente E2E ${Date.now()}`;
    const editado = `${nome} Editado`;

    cy.contains('button', 'Novo Cliente').click();
    cy.get('#c-nome').type(nome);
    cy.get('#c-cpf').type(cpfAleatorio());
    cy.get('#c-contato').type('11987654321');
    cy.contains('button', 'Salvar Cliente').click();

    cy.get('#busca-cli').type(nome);
    cy.contains('tr', nome).should('contain', '(11) 98765-4321');

    cy.get(`[aria-label="Editar ${nome}"]`).click();
    cy.get('#c-nome').clear().type(editado);
    cy.contains('button', 'Salvar Cliente').click();

    cy.get('#busca-cli').clear().type(editado);
    cy.contains('tr', editado).should('be.visible');

    cy.get(`[aria-label="Excluir ${editado}"]`).click();
    cy.get('[role=alertdialog]').contains('button', 'Excluir Definitivamente').click();
    cy.contains('tr', editado).should('not.exist');
    cy.contains('Nenhum cliente encontrado').should('be.visible');
  });

  it('valida campos obrigatórios e CPF inválido', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.contains('button', 'Salvar Cliente').click();
    cy.get('#c-nome').should('have.class', 'border-rose-600');

    cy.get('#c-nome').type('Fulano');
    cy.get('#c-cpf').type('11111111111');
    cy.get('#c-contato').type('11999990000');
    cy.contains('button', 'Salvar Cliente').click();
    cy.get('#c-cpf').should('have.class', 'border-rose-600');
  });

  it('não permite CPF duplicado', () => {
    const cpf = cpfAleatorio();
    const preencher = (nome: string) => {
      cy.contains('button', 'Novo Cliente').click();
      cy.get('#c-nome').type(nome);
      cy.get('#c-cpf').type(cpf);
      cy.get('#c-contato').type('11999990000');
      cy.contains('button', 'Salvar Cliente').click();
    };
    preencher(`Dup A ${Date.now()}`);
    cy.get('#c-nome').should('not.exist');
    preencher(`Dup B ${Date.now()}`);
    cy.get('[role=alert]').should('be.visible');
    cy.get('#c-nome').should('exist');
  });

  it('mostra estado vazio ao buscar algo inexistente e limpa a busca', () => {
    cy.get('#busca-cli').type('zzzz-inexistente-zzzz');
    cy.contains('Nenhum cliente encontrado').should('be.visible');
    cy.contains('button', 'Limpar busca').click();
    cy.get('#busca-cli').should('have.value', '');
  });
});
