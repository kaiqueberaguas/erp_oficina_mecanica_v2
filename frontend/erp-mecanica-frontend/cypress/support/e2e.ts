// Pré-requisitos: MySQL (docker compose up -d mysql), API em http://localhost:5234 e `npm start`.
export const API = 'http://localhost:5234/api/v1';
export const ADMIN = { login: 'admin@oficina.com', senha: 'Admin@123' };

beforeEach(() => {
  cy.clearAllSessionStorage();
});
