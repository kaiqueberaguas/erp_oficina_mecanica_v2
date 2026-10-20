import { Component, computed, inject, signal } from '@angular/core';
import { Carro, CarroService } from '../../services/carro.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carros',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './carros.html',
  styleUrl: './carros.css',
})
export class Carros {
  protected readonly carroService = inject(CarroService);

  protected carros: Carro[] =
    this.carroService.listar();

  protected novoCarro: Carro = {
    id: 0,
    placa: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    cliente: '',
  };

  protected editando = false;

  protected busca = signal('');

  protected carrosFiltrados = computed(() => {
    const texto = this.busca().toLowerCase();

    return this.carros.filter(
      (carro) =>
        carro.placa.toLowerCase().includes(texto) ||
        carro.modelo.toLowerCase().includes(texto) ||
        carro.marca.toLowerCase().includes(texto)
    );
  });

  protected salvarCarro(): void {
    if (this.editando) {
      this.carroService.editar(this.novoCarro);
    } else {
      this.carroService.criar(this.novoCarro);
    }

    this.carros = this.carroService.listar();

    this.novoCarro = {
      id: 0,
      placa: '',
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      cliente: '',
    };

    this.editando = false;
  }

  protected editarCarro(carro: Carro): void {
    this.novoCarro = { ...carro };
    this.editando = true;
  }

  protected mostrarModalExclusao = false;

  protected carroSelecionado: Carro | null = null;

  protected abrirModalExclusao(carro: Carro): void {
    this.carroSelecionado = carro;
    this.mostrarModalExclusao = true;
  }

  protected cancelarExclusao(): void {
    this.mostrarModalExclusao = false;
    this.carroSelecionado = null;
  }

  protected excluirCarro(): void {
    if (!this.carroSelecionado) {
      return;
    }

    this.carroService.excluir(
      this.carroSelecionado.id
    );

    this.carros = this.carroService.listar();

    this.cancelarExclusao();
  }
}