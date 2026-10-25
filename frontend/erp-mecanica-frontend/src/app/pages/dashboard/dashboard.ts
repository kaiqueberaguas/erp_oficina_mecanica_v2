import { Component, computed, inject, signal } from '@angular/core';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { Dashboard as DashboardDados } from '../../models/dashboard';
import { DashboardService } from '../../services/dashboard.service';
import { mensagemErro } from '../../utils/erro-api';
import { moeda } from '../../utils/formatacao';

const CIRCUNFERENCIA = 2 * Math.PI * 66;

const dec1 = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Arredonda o máximo para cima até 1, 2, 5 ou 10 × 10^n, para um eixo legível. */
function maximoEixo(valor: number): number {
  if (valor <= 0) return 4;
  const base = 10 ** Math.floor(Math.log10(valor));
  return [1, 2, 5, 10].map((m) => m * base).find((m) => m >= valor)!;
}

const rotuloEixo = (n: number) =>
  n >= 1000
    ? (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k'
    : n.toLocaleString('pt-BR');

const eixo = (max: number) => [1, 0.75, 0.5, 0.25, 0].map((f) => rotuloEixo(max * f));

/** Rótulo, cor SVG e classe da legenda por status da API; a ordem define a ordem na rosca. */
const STATUS: Record<string, [string, string, string]> = {
  finalizada: ['Finalizada', '#059669', 'bg-emerald-600'],
  emandamento: ['Em andamento', '#0369a1', 'bg-sky-700'],
  inicio: ['Início', '#f59e0b', 'bg-amber-500'],
  rascunho: ['Rascunho', '#94a3b8', 'bg-slate-400'],
  cancelada: ['Cancelada', '#e11d48', 'bg-rose-600'],
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  host: { class: 'flex flex-col gap-6' },
  imports: [KpiCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly service = inject(DashboardService);

  protected readonly dados = signal<DashboardDados | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');

  protected readonly total = computed(() => this.dados()?.kpis.totalOrdens ?? 0);
  protected readonly vazio = computed(
    () => !this.carregando() && !this.erro() && this.total() === 0,
  );

  constructor() {
    this.service.obter().subscribe({
      next: (d) => {
        this.dados.set(d);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e, 'Não foi possível carregar o dashboard.'));
        this.carregando.set(false);
      },
    });
  }

  protected readonly kpi = computed(() => {
    const k = this.dados()?.kpis;
    return {
      faturamento: moeda(k?.faturamentoTotal ?? 0),
      ticket: moeda(k?.ticketMedio ?? 0),
      lead: dec1(k?.tempoMedioReparoDias ?? 0) + ' dias',
    };
  });

  /** Chips do card "Total de Ordens": abertas = rascunho + início + em andamento. */
  protected readonly resumo = computed(() => {
    const qtd = (...nomes: string[]) =>
      (this.dados()?.statusDistribuicao ?? [])
        .filter((s) => nomes.includes(s.status))
        .reduce((soma, s) => soma + s.quantidade, 0);
    return {
      abertas: qtd('rascunho', 'inicio', 'emandamento'),
      finalizadas: qtd('finalizada'),
      canceladas: qtd('cancelada'),
    };
  });

  private readonly maxFaturamento = computed(() =>
    maximoEixo(Math.max(0, ...(this.dados()?.faturamentoMensal ?? []).map((m) => m.valor))),
  );
  private readonly maxOrdens = computed(() =>
    maximoEixo(Math.max(0, ...(this.dados()?.faturamentoMensal ?? []).map((m) => m.quantidade))),
  );

  protected readonly eixoFaturamento = computed(() => eixo(this.maxFaturamento()));
  protected readonly eixoOrdens = computed(() => eixo(this.maxOrdens()));

  protected readonly meses = computed(() => {
    const lista = this.dados()?.faturamentoMensal ?? [];
    return lista.map((m, i) => ({
      rotulo: m.mes,
      altura: ((m.valor / this.maxFaturamento()) * 100).toFixed(1) + '%',
      x: (((i + 0.5) / lista.length) * 100).toFixed(2) + '%',
      y: ((m.quantidade / this.maxOrdens()) * 100).toFixed(1) + '%',
      dica: `${m.mes}: ${moeda(m.valor)} · ${m.quantidade} OS`,
    }));
  });

  protected readonly pontosLinha = computed(() => {
    const lista = this.dados()?.faturamentoMensal ?? [];
    return lista
      .map(
        (m, i) =>
          `${((i + 0.5) * 100).toFixed(0)},${(240 - (m.quantidade / this.maxOrdens()) * 240).toFixed(1)}`,
      )
      .join(' ');
  });

  protected readonly descricaoGrafico = computed(
    () =>
      'Faturamento e quantidade de ordens por mês. ' +
      (this.dados()?.faturamentoMensal ?? [])
        .map((m) => `${m.mes}: ${moeda(m.valor)}, ${m.quantidade} OS`)
        .join('; '),
  );

  protected readonly rosca = computed(() => {
    const total = this.total();
    const existentes = this.dados()?.statusDistribuicao ?? [];
    let acumulado = 0;
    return Object.entries(STATUS)
      .map(([chave, [rotulo, cor, corClasse]]) => ({
        rotulo,
        cor,
        corClasse,
        qtd: existentes.find((s) => s.status === chave)?.quantidade ?? 0,
      }))
      .filter((f) => f.qtd > 0)
      .map((f) => {
        const tamanho = (f.qtd / total) * CIRCUNFERENCIA;
        const fatia = {
          ...f,
          pct: ((f.qtd / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%',
          dash: `${tamanho.toFixed(2)} ${(CIRCUNFERENCIA - tamanho).toFixed(2)}`,
          deslocamento: (-acumulado).toFixed(2),
        };
        acumulado += tamanho;
        return fatia;
      });
  });

  protected readonly descricaoRosca = computed(
    () =>
      'Status das ordens: ' +
      this.rosca()
        .map((f) => `${f.rotulo} ${f.qtd} (${f.pct})`)
        .join(', '),
  );

  protected readonly marcas = computed(() => {
    const lista = this.dados()?.topMarcas ?? [];
    const maior = lista[0]?.totalOS ?? 1;
    return lista.map((m) => ({
      nome: m.marca,
      qtd: m.totalOS,
      largura: ((m.totalOS / maior) * 100).toFixed(1) + '%',
    }));
  });
}
