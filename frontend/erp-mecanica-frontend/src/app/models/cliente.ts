export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  contato: string;
  totalCarros: number;
}

export interface ClienteForm {
  nome: string;
  cpf: string;
  contato: string;
}
