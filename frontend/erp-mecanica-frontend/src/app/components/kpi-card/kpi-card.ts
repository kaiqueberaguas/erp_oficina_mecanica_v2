import { Component, input } from '@angular/core';
import { Icone } from '../icone';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [Icone],
  host: { class: 'block' },
  template: `
    <article class="flex h-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 class="m-0 text-sm font-medium text-slate-600">{{ titulo() }}</h2>
        <p class="m-0 text-[28px] font-bold tracking-tight whitespace-nowrap">{{ valor() }}</p>
        <ng-content>
          <p class="m-0 text-[13px] text-slate-500">{{ detalhe() }}</p>
        </ng-content>
      </div>
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-full"
        [class]="corIcone()"
      >
        <app-icone [nome]="icone()" [tamanho]="22" />
      </span>
    </article>
  `,
})
export class KpiCard {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly detalhe = input('');
  readonly icone = input.required<string>();
  readonly corIcone = input('bg-slate-100 text-slate-700');
}
