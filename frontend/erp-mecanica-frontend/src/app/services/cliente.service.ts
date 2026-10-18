import { Injectable } from '@angular/core';

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private clientes: Cliente[] = [
    {
      id: 1,
      nome: 'João Silva',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
    },
    {
      id: 2,
      nome: 'Maria Souza',
      cpf: '987.654.321-00',
      telefone: '(11) 98888-8888',
    },
  ];

  listar(): Cliente[] {
    return this.clientes;
  }

  criar(cliente: Cliente): void {
    this.clientes.push({
      ...cliente,
      id: this.clientes.length + 1,
    });
  }

  editar(clienteAtualizado: Cliente): void {
    this.clientes = this.clientes.map((cliente) =>
      cliente.id === clienteAtualizado.id
        ? clienteAtualizado
        : cliente
    );
  }

  excluir(id: number): void {
    this.clientes = this.clientes.filter(
      (cliente) => cliente.id !== id
    );
  }
}