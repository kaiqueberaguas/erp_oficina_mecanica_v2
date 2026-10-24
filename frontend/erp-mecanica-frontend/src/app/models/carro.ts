export interface Carro {
  id: number;
  clienteId: number;
  marca: string;
  modelo: string;
  placa: string;
  totalOrdens: number;
  clienteNome: string | null;
}

export interface CarroForm {
  clienteId: number;
  marca: string;
  modelo: string;
  placa: string;
}
