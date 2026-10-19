import { TestBed } from '@angular/core/testing';

import {
  ClienteService,
  Cliente
} from './cliente.service';

describe('ClienteService', () => {
  let service: ClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar clientes', () => {
    expect(service.listar().length)
      .toBeGreaterThan(0);
  });

  it('deve criar um cliente', () => {
    const quantidadeInicial =
      service.listar().length;

    const novoCliente: Cliente = {
      id: 0,
      nome: 'Ana Silva',
      cpf: '111.111.111-11',
      telefone: '(11) 99999-0000',
    };

    service.criar(novoCliente);

    expect(service.listar().length)
      .toBe(quantidadeInicial + 1);
  });

  it('deve editar um cliente', () => {
    const cliente = service.listar()[0];

    const atualizado: Cliente = {
      ...cliente,
      nome: 'Nome Atualizado',
    };

    service.editar(atualizado);

    expect(service.listar()[0].nome)
      .toBe('Nome Atualizado');
  });

  it('deve excluir um cliente', () => {
    const cliente = service.listar()[0];

    const quantidadeInicial =
      service.listar().length;

    service.excluir(cliente.id);

    expect(service.listar().length)
      .toBe(quantidadeInicial - 1);
  });
});