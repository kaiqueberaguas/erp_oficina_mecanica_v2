import { criarCarroApi, criarClienteApi, criarOrdemApi, entrarComoAdmin } from '../support/api';
import type { Sessao } from '../support/api';

describe('Ordens de serviço', () => {
  let placa: string;

  beforeEach(() => {
    entrarComoAdmin();
    cy.get<Sessao>('@sessao').then((s) => {
      criarClienteApi(s.token, `Cliente OS ${Date.now()}`).then((c) =>
        criarCarroApi(s.token, c.id).then((carro) => {
          placa = carro.placa;
          cy.wrap(carro.id).as('carroId');
        }),
      );
    });
  });

  const criarOrdemPorApi = (descricao: string) =>
    cy.get<Sessao>('@sessao').then((s) =>
      cy.get<number>('@carroId').then((carroId) => criarOrdemApi(s.token, carroId, descricao)),
    );

  it('abre uma nova OS pela tela e a encontra na listagem', () => {
    cy.visit('/ordens');
    cy.contains('button', 'Nova Ordem de Serviço').click();
    cy.get('#os-veic').type(placa);
    cy.get('[role=option]').contains(`${placa.slice(0, 3)}-${placa.slice(3)}`).click();
    cy.get('#os-desc').type('Revisão geral e troca de pastilhas');
    cy.get('#os-valor').type('25000');
    cy.contains('button', 'Abrir Ordem de Serviço').click();

    cy.get('#busca-os').type(placa);
    cy.contains('tr', 'Revisão geral').should('contain', '250,00').and('contain', 'Rascunho');
  });

  it('valida campos obrigatórios da nova OS', () => {
    cy.visit('/ordens');
    cy.contains('button', 'Nova Ordem de Serviço').click();
    cy.contains('button', 'Abrir Ordem de Serviço').click();
    cy.get('#os-desc').should('have.class', 'border-rose-600');
  });

  it('avança a etapa da OS e a encontra na aba de abertas', () => {
    criarOrdemPorApi('Alinhamento E2E');
    cy.visit('/ordens');
    cy.get('#busca-os').type(placa);
    cy.contains('tr', 'Alinhamento E2E').find('[aria-label^="Atualizar status"]').click();

    cy.get('[role=radiogroup]').contains('button', 'Em andamento').click();
    cy.contains('button', 'Salvar Alterações').click();

    cy.contains('button', 'Fechar').click();
    cy.contains('tr', 'Alinhamento E2E').should('contain', 'Em andamento');
    cy.contains('[role=tab]', 'Abertas').click();
    cy.contains('tr', 'Alinhamento E2E').should('be.visible');
  });

  it('exclui uma OS', () => {
    criarOrdemPorApi('OS para excluir');
    cy.visit('/ordens');
    cy.get('#busca-os').type(placa);
    cy.contains('tr', 'OS para excluir').find('[aria-label^="Excluir OS"]').click();
    cy.get('[role=alertdialog]').contains('button', 'Excluir OS').click();
    cy.contains('tr', 'OS para excluir').should('not.exist');
  });
});
