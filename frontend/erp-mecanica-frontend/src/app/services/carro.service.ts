import { Injectable } from '@angular/core';

export interface Carro {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cliente: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarroService {
  private carros: Carro[] = [
    {
      id: 1,
      placa: 'ABC1D23',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2020,
      cliente: 'João Silva',
    },
    {
      id: 2,
      placa: 'XYZ9K88',
      marca: 'Honda',
      modelo: 'Civic',
      ano: 2022,
      cliente: 'Maria Souza',
    },
  ];

  listar(): Carro[] {
    return this.carros;
  }

  criar(carro: Carro): void {
    this.carros.push({
      ...carro,
      id: this.carros.length + 1,
    });
  }

  editar(carroAtualizado: Carro): void {
    this.carros = this.carros.map((carro) =>
      carro.id === carroAtualizado.id
        ? carroAtualizado
        : carro
    );
  }

  excluir(id: number): void {
    this.carros = this.carros.filter(
      (carro) => carro.id !== id
    );
  }
}