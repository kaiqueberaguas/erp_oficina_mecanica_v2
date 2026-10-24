import { Component, computed, input } from '@angular/core';
import { EtapaOrdem } from '../../models/ordem';

export const STATUS_ORDEM: Record<
  EtapaOrdem,
  { rotulo: string; fundo: string; texto: string; ponto: string; borda: string }
> = {
  [EtapaOrdem.Rascunho]: {
    rotulo: 'Rascunho',
    fundo: 'bg-slate-100',
    texto: 'text-slate-700',
    ponto: 'bg-slate-500',
    borda: 'border-slate-500',
  },
  [EtapaOrdem.Inicio]: {
    rotulo: 'Início',
    fundo: 'bg-sky-100',
    texto: 'text-sky-800',
    ponto: 'bg-sky-600',
    borda: 'border-sky-600',
  },
  [EtapaOrdem.EmAndamento]: {
    rotulo: 'Em andamento',
    fundo: 'bg-amber-100',
    texto: 'text-amber-800',
    ponto: 'bg-amber-500',
    borda: 'border-amber-500',
  },
  [EtapaOrdem.Finalizada]: {
    rotulo: 'Finalizada',
    fundo: 'bg-emerald-100',
    texto: 'text-emerald-800',
    ponto: 'bg-emerald-600',
    borda: 'border-emerald-600',
  },
  [EtapaOrdem.Cancelada]: {
    rotulo: 'Cancelada',
    fundo: 'bg-rose-100',
    texto: 'text-rose-800',
    ponto: 'bg-rose-600',
    borda: 'border-rose-600',
  },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[13px] font-semibold"
      [class]="estilo().fundo + ' ' + estilo().texto"
    >
      <span class="size-2 rounded-full" [class]="estilo().ponto"></span>{{ estilo().rotulo }}
    </span>
  `,
})
export class StatusBadge {
  readonly etapa = input.required<EtapaOrdem>();
  protected readonly estilo = computed(() => STATUS_ORDEM[this.etapa()]);
}
