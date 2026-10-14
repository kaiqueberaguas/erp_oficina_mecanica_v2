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

  protected salvarCliente(): void {
    this.clienteService.criar(this.novoCliente);

    this.novoCliente = {
      id: 0,
      nome: '',
      cpf: '',
      telefone: '',
    };

    this.clientes = this.clienteService.listar();
  }

  protected excluirCliente(id: number): void {
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