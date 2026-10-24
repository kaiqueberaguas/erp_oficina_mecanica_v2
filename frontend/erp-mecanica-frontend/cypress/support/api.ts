import { ADMIN, API } from './e2e';

export interface Sessao {
  token: string;
  expiraEm: string;
  usuario: { id: number; nome: string; login: string };
}

/** CPF válido (com dígitos verificadores), só dígitos, para evitar colisão entre execuções. */
export function cpfAleatorio(): string {
  const d = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  if (new Set(d).size === 1) d[0] = (d[0] + 1) % 10;
  for (const n of [9, 10]) {
    const soma = d.reduce((acc, v, i) => acc + v * (n + 1 - i), 0);
    const r = (soma * 10) % 11;
    d.push(r === 10 ? 0 : r);
  }
  return d.join('');
}

export function placaAleatoria(): string {
  const letra = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${letra()}${letra()}${letra()}${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Autentica o admin pela API e grava a sessão como o front espera (sessionStorage). */
export function entrarComoAdmin(): void {
  cy.request('POST', `${API}/auth/login`, { login: ADMIN.login, senha: ADMIN.senha }).then(({ body }) => {
    const s = body as Sessao;
    cy.wrap(s).as('sessao');
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('erp.token', s.token);
        win.sessionStorage.setItem('erp.usuario', JSON.stringify(s.usuario));
        win.sessionStorage.setItem('erp.expiraEm', s.expiraEm);
      },
    });
  });
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export function criarClienteApi(token: string, nome: string) {
  return cy
    .request({
      method: 'POST',
      url: `${API}/clientes`,
      headers: auth(token),
      body: { nome, cpf: cpfAleatorio(), contato: '11999990000' },
    })
    .its('body') as Cypress.Chainable<{ id: number; nome: string }>;
}

export function criarCarroApi(token: string, clienteId: number, placa = placaAleatoria()) {
  return cy
    .request({
      method: 'POST',
      url: `${API}/carros`,
      headers: auth(token),
      body: { clienteId, marca: 'Fiat', modelo: 'Uno', placa },
    })
    .its('body') as Cypress.Chainable<{ id: number; placa: string }>;
}

export function criarOrdemApi(token: string, carroId: number, descricaoOrdem = 'Troca de óleo') {
  return cy
    .request({
      method: 'POST',
      url: `${API}/ordens`,
      headers: auth(token),
      body: { carroId, descricaoOrdem, valorServico: 150 },
    })
    .its('body') as Cypress.Chainable<{ id: number }>;
}
