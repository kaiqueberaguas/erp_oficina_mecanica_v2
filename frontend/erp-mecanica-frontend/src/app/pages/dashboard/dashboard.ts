import { Component, computed, signal } from '@angular/core';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { Icone } from '../../components/icone';
import { moeda } from '../../utils/formatacao';

type Periodo = 'mes' | 'tri' | 'ano';

interface DadosPeriodo {
  faturamento: number;
  abertas: number;
  finalizadas: number;
  canceladas: number;
  lead: number;
  patio: number;
  /** Quantidade de meses (a partir do último) destacados no gráfico. */
  meses: number;
  marcas: [string, number][];
}

// Dados estáticos do mock; ainda sem conexão com o backend (GET /api/v1/dashboard).
const DADOS: Record<Periodo, DadosPeriodo> = {
  mes: { faturamento: 45800, abertas: 15, finalizadas: 80, canceladas: 5, lead: 3.2, patio: 1.6, meses: 1, marcas: [['Volkswagen', 28], ['Chevrolet', 22], ['Fiat', 19], ['Toyota', 16], ['Ford', 15]] },
  tri: { faturamento: 131900, abertas: 18, finalizadas: 236, canceladas: 14, lead: 3.5, patio: 1.9, meses: 3, marcas: [['Volkswagen', 71], ['Fiat', 58], ['Chevrolet', 55], ['Toyota', 44], ['Ford', 40]] },
  ano: { faturamento: 397300, abertas: 15, finalizadas: 736, canceladas: 41, lead: 3.4, patio: 1.8, meses: 10, marcas: [['Volkswagen', 204], ['Chevrolet', 171], ['Fiat', 166], ['Toyota', 131], ['Ford', 120]] },
};

const MESES: [string, number, number][] = [
  ['Jan', 34200, 68], ['Fev', 31800, 63], ['Mar', 38900, 77], ['Abr', 36500, 72], ['Mai', 41200, 81],
  ['Jun', 39700, 78], ['Jul', 43100, 85], ['Ago', 42700, 83], ['Set', 43400, 85], ['Out', 45800, 100],
];
const FATURAMENTO_MAX = 50000;
const ORDENS_MAX = 120;
const CIRCUNFERENCIA = 2 * Math.PI * 66;

const PATIO = [
  { placa: 'RIO2A18', carro: 'Fiat Palio', cliente: 'João Silva', dias: '4 dias', alerta: true },
  { placa: 'BRA2E19', carro: 'Toyota Corolla', cliente: 'Mariana Souza', dias: '2 dias', alerta: false },
  { placa: 'QWE-4821', carro: 'VW Gol', cliente: 'Pedro Almeida', dias: '1 dia', alerta: false },
];

const dec1 = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

@Component({
  selector: 'app-dashboard',
  standalone: true,
  host: { class: 'flex flex-col gap-6' },
  imports: [KpiCard, Icone],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly periodos: { id: Periodo; rotulo: string }[] = [
    { id: 'mes', rotulo: 'Mês Atual' },
    { id: 'tri', rotulo: 'Últimos 3 Meses' },
    { id: 'ano', rotulo: 'Ano' },
  ];
  protected readonly periodo = signal<Periodo>('mes');
  protected readonly patio = PATIO;
  protected readonly eixoFaturamento = ['50k', '37,5k', '25k', '12,5k', '0'];
  protected readonly eixoOrdens = ['120', '90', '60', '30', '0'];

  protected readonly dados = computed(() => DADOS[this.periodo()]);
  protected readonly total = computed(() => {
    const d = this.dados();
    return d.abertas + d.finalizadas + d.canceladas;
  });

  protected readonly kpi = computed(() => {
    const d = this.dados();
    return {
      faturamento: moeda(d.faturamento),
      ticket: moeda(d.faturamento / d.finalizadas),
      lead: dec1(d.lead) + ' dias',
      patio: dec1(d.patio) + ' dias',
    };
  });

  protected readonly meses = computed(() => {
    const destaque = this.dados().meses;
    return MESES.map(([rotulo, faturamento, ordens], i) => ({
      rotulo: rotulo + '/26',
      destacado: i >= MESES.length - destaque,
      altura: ((faturamento / FATURAMENTO_MAX) * 100).toFixed(1) + '%',
      x: (((i + 0.5) / MESES.length) * 100).toFixed(2) + '%',
      y: ((ordens / ORDENS_MAX) * 100).toFixed(1) + '%',
      dica: `${rotulo}/26: ${moeda(faturamento)} · ${ordens} OS`,
    }));
  });

  protected readonly pontosLinha = MESES.map(
    ([, , q], i) => `${((i + 0.5) * 100).toFixed(0)},${(240 - (q / ORDENS_MAX) * 240).toFixed(1)}`,
  ).join(' ');

  protected readonly descricaoGrafico =
    'Faturamento e quantidade de ordens por mês, de Jan/26 a Out/26. ' +
    MESES.map(([l, f, q]) => `${l}: ${moeda(f)}, ${q} OS`).join('; ');

  protected readonly rosca = computed(() => {
    const d = this.dados();
    const total = this.total();
    let acumulado = 0;
    return (
      [
        ['Finalizadas', d.finalizadas, '#059669', 'bg-emerald-600'],
        ['Abertas', d.abertas, '#f59e0b', 'bg-amber-500'],
        ['Canceladas', d.canceladas, '#e11d48', 'bg-rose-600'],
      ] as [string, number, string, string][]
    ).map(([rotulo, qtd, cor, corClasse]) => {
      const tamanho = (qtd / total) * CIRCUNFERENCIA;
      const fatia = {
        rotulo,
        qtd,
        cor,
        corClasse,
        pct: ((qtd / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%',
        dash: `${tamanho.toFixed(2)} ${(CIRCUNFERENCIA - tamanho).toFixed(2)}`,
        deslocamento: (-acumulado).toFixed(2),
      };
      acumulado += tamanho;
      return fatia;
    });
  });

  protected readonly descricaoRosca = computed(
    () =>
      'Status das ordens: ' + this.rosca().map((f) => `${f.rotulo} ${f.qtd} (${f.pct})`).join(', '),
  );

  protected readonly marcas = computed(() => {
    const lista = this.dados().marcas;
    const maior = lista[0][1];
    return lista.map(([nome, qtd]) => ({ nome, qtd, largura: ((qtd / maior) * 100).toFixed(1) + '%' }));
  });
}
