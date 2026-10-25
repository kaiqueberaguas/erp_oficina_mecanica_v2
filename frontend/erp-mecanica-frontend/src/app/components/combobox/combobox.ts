import { Component, computed, input, output, signal } from '@angular/core';
import { semAcento } from '../../utils/formatacao';
import { Icone } from '../icone';

export interface OpcaoCombobox {
  id: number;
  /** Texto exibido no campo ao selecionar. */
  rotulo: string;
  /** Texto usado na busca (inclui nome, CPF, placa...). */
  busca: string;
  principal: string;
  secundario?: string;
  terciario?: string;
  mono?: boolean;
}

let proximoId = 0;

/** Select com busca (autocomplete) usado para escolher cliente e veículo. */
@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [Icone],
  template: `
    <div class="relative">
      <span class="pointer-events-none absolute top-3.5 left-3.5 text-slate-500">
        <app-icone nome="lupa" />
      </span>
      <input
        [id]="inputId()"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        [attr.aria-expanded]="aberto()"
        [attr.aria-controls]="listaId"
        [placeholder]="placeholder()"
        [value]="texto()"
        (input)="digitar($any($event.target).value)"
        (focus)="aberto.set(true)"
        (click)="aberto.set(true)"
        (keydown.escape)="fecharLista($event)"
        class="box-border h-11 w-full rounded-lg border bg-white pr-3.5 pl-10 text-[15px]"
        [class]="erro() ? 'border-rose-600' : 'border-slate-300'"
      />
      @if (aberto()) {
        <ul
          [id]="listaId"
          role="listbox"
          class="absolute z-10 mt-1 max-h-56 w-full list-none overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          @for (o of opcoesFiltradas(); track o.id) {
            <li role="option" [attr.aria-selected]="o.id === valor()">
              <button
                type="button"
                (mousedown)="$event.preventDefault()"
                (click)="escolher(o)"
                class="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-sky-50"
                [class.bg-sky-50]="o.id === valor()"
              >
                <span
                  [class]="
                    o.mono
                      ? 'rounded border border-slate-400 bg-white px-1.5 py-0.5 font-mono text-[13px] font-semibold'
                      : 'font-medium'
                  "
                  >{{ o.principal }}</span
                >
                @if (o.secundario) {
                  <span class="text-slate-700">{{ o.secundario }}</span>
                }
                @if (o.terciario) {
                  <span class="ml-auto text-slate-500">{{ o.terciario }}</span>
                }
              </button>
            </li>
          } @empty {
            <li class="px-2.5 py-2 text-sm text-slate-500">{{ semResultado() }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class Combobox {
  protected readonly listaId = `combo-lista-${proximoId++}`;

  readonly inputId = input('');
  readonly opcoes = input.required<OpcaoCombobox[]>();
  readonly valor = input<number | null>(null);
  readonly placeholder = input('');
  readonly semResultado = input('Nenhum resultado.');
  readonly erro = input(false);
  readonly valorChange = output<number | null>();
  /** Texto digitado, para quem alimenta as opções por busca remota. */
  readonly buscaChange = output<string>();

  protected readonly aberto = signal(false);
  private readonly digitado = signal<string | null>(null);

  protected readonly texto = computed(
    () => this.digitado() ?? this.opcoes().find((o) => o.id === this.valor())?.rotulo ?? '',
  );

  protected readonly opcoesFiltradas = computed(() => {
    const q = semAcento(this.digitado() ?? '').trim();
    const qd = q.replace(/[^a-z0-9]/g, '');
    return this.opcoes().filter((o) => {
      const alvo = semAcento(o.busca);
      return !q || alvo.includes(q) || (qd && alvo.replace(/[^a-z0-9]/g, '').includes(qd));
    });
  });

  protected digitar(v: string): void {
    this.digitado.set(v);
    this.aberto.set(true);
    this.valorChange.emit(null);
    this.buscaChange.emit(v);
  }

  protected escolher(o: OpcaoCombobox): void {
    this.digitado.set(null);
    this.aberto.set(false);
    this.valorChange.emit(o.id);
  }

  protected fecharLista(ev: Event): void {
    if (this.aberto()) {
      // Fecha só a lista; o Esc não deve fechar o modal que contém o campo.
      ev.preventDefault();
      ev.stopPropagation();
      this.aberto.set(false);
    }
  }

  /** Limpa o texto digitado (usado ao reabrir o formulário). */
  reiniciar(): void {
    this.digitado.set(null);
    this.aberto.set(false);
  }
}
