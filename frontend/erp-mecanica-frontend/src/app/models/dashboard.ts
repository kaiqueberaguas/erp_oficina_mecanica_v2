export interface DashboardKpis {
  faturamentoTotal: number;
  ticketMedio: number;
  tempoMedioReparoDias: number;
  totalOrdens: number;
}

export interface StatusQuantidade {
  status: string;
  quantidade: number;
}

export interface FaturamentoMensal {
  mes: string;
  valor: number;
  quantidade: number;
}

export interface MarcaTotal {
  marca: string;
  totalOS: number;
}

export interface Dashboard {
  kpis: DashboardKpis;
  statusDistribuicao: StatusQuantidade[];
  faturamentoMensal: FaturamentoMensal[];
  topMarcas: MarcaTotal[];
}
