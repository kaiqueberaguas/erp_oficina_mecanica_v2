import { Component, computed, inject, signal } from '@angular/core';
import { Cliente, ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  private readonly clienteService = inject(ClienteService);

  protected clientes: Cliente[] =
    this.clienteService.listar();

  protected busca = signal('');

  protected clientesFiltrados = computed(() => {
  const texto = this.busca().toLowerCase();

  return this.clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(texto)
  );
});
}