import { Component, computed, input, output } from '@angular/core';
import { TAMANHO_PAGINA } from '../../utils/lista-paginada';

/** Rodapé de listagem: resumo "Mostrando X de Y" e navegação Anterior/Próxima. */
@Component({
  selector: 'app-paginacao',
  standalone: true,
  template: `
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm text-slate-600"
    >
      <span>Mostrando {{ exibidos() }} de {{ total() }} {{ rotulo() }}</span>
      <div class="flex gap-1.5">
        <button
          type="button"
          [disabled]="pagina() <= 1"
          (click)="paginaChange.emit(pagina() - 1)"
          class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400"
        >
          Anterior
        </button>
        <span
          aria-current="page"
          class="box-border flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-900 font-semibold text-white"
          >{{ pagina() }}</span
        >
        <button
          type="button"
          [disabled]="pagina() >= totalPaginas()"
          (click)="paginaChange.emit(pagina() + 1)"
          class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400"
        >
          Próxima
        </button>
      </div>
    </div>
  `,
})
export class Paginacao {
  readonly pagina = input.required<number>();
  readonly total = input.required<number>();
  readonly itensNaPagina = input.required<number>();
  readonly rotulo = input.required<string>();
  readonly paginaChange = output<number>();

  protected readonly totalPaginas = computed(() => Math.ceil(this.total() / TAMANHO_PAGINA));
  protected readonly exibidos = computed(() => this.itensNaPagina());
}
