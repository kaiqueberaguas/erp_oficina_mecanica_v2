import { Component, computed, inject, signal } from '@angular/core';
import { Cliente, ClienteService } from '../../services/cliente.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  protected readonly clienteService = inject(ClienteService);

  protected clientes: Cliente[] =
    this.clienteService.listar();

  protected novoCliente: Cliente = {
    id: 0,
    nome: '',
    cpf: '',
    telefone: '',
  };

  protected editando = false;

  protected editarCliente(cliente: Cliente): void {
    this.novoCliente = { ...cliente };
    this.editando = true;
  }

  protected salvarCliente(): void {
    if (this.editando) {
      this.clienteService.editar(this.novoCliente);
    } else {
      this.clienteService.criar(this.novoCliente);
    }

    this.clientes = this.clienteService.listar();

    this.novoCliente = {
      id: 0,
      nome: '',
      cpf: '',
      telefone: '',
    };

    this.editando = false;
  }

  protected excluirCliente(id: number): void {
    const confirmar = confirm(
      'Tem certeza que deseja excluir este cliente?'
    );

    if (!confirmar) {
      return;
    }

    this.clienteService.excluir(id);

    this.clientes = this.clienteService.listar();
  }

  protected busca = signal('');

  protected clientesFiltrados = computed(() => {
  const texto = this.busca().toLowerCase();

  return this.clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(texto)
  );
});
}