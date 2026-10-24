/** Etapas da OS, na mesma numeração do backend (`EtapaOrdem`). */
export enum EtapaOrdem {
  Rascunho = 1,
  Inicio = 2,
  EmAndamento = 3,
  Finalizada = 4,
  Cancelada = 5,
}

export interface Ordem {
  id: number;
  carroId: number;
  descricaoOrdem: string;
  valorServico: number;
  etapa: EtapaOrdem;
  /** Datas no formato ISO (AAAA-MM-DD). */
  dataEntradaCarro: string;
  dataInicioServico: string | null;
  dataFimServico: string | null;
  dataRetiradaVeiculo: string | null;
  observacao: string | null;
  placa: string | null;
  marca: string | null;
  modelo: string | null;
  clienteNome: string | null;
}

export interface OrdemForm {
  carroId: number;
  descricaoOrdem: string;
  valorServico: number;
  dataEntradaCarro: string;
}

export interface AtualizarEtapa {
  etapa: EtapaOrdem;
  dataRetiradaVeiculo?: string;
  observacao?: string;
}
