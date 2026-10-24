import { HttpErrorResponse } from '@angular/common/http';
import { mensagemErro } from './erro-api';

describe('mensagemErro', () => {
  it('usa o texto padrão quando não é um erro HTTP', () => {
    expect(mensagemErro(new Error('x'))).toBe('Não foi possível concluir a operação.');
    expect(mensagemErro('x', 'Falhou.')).toBe('Falhou.');
  });

  it('informa a falta de conexão (status 0)', () => {
    expect(mensagemErro(new HttpErrorResponse({ status: 0 }))).toBe('Sem conexão com o servidor.');
  });

  it('prefere a primeira mensagem de validação', () => {
    const erro = new HttpErrorResponse({
      status: 400,
      error: { title: 'One or more validation errors occurred.', errors: { Cpf: ['CPF inválido.'] } },
    });
    expect(mensagemErro(erro)).toBe('CPF inválido.');
  });

  it('usa o title do ProblemDetails das exceções de domínio', () => {
    const erro = new HttpErrorResponse({
      status: 409,
      error: { title: 'Já existe um carro cadastrado com esta placa.' },
    });
    expect(mensagemErro(erro)).toBe('Já existe um carro cadastrado com esta placa.');
  });

  it('cai no texto padrão quando o corpo não tem mensagem', () => {
    expect(mensagemErro(new HttpErrorResponse({ status: 500 }), 'Padrão.')).toBe('Padrão.');
    expect(mensagemErro(new HttpErrorResponse({ status: 500, error: { errors: { A: [1] } } }), 'Padrão.')).toBe(
      'Padrão.',
    );
  });
});
