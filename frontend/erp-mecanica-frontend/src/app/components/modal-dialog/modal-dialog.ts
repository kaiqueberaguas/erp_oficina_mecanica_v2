import { Component, HostListener, input, output } from '@angular/core';
import { Icone } from '../icone';

let proximoId = 0;

@Component({
  selector: 'app-modal-dialog',
  standalone: true,
  imports: [Icone],
  template: `
    <div
      class="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 pb-10 backdrop-blur-[3px]"
      [class]="topo()"
      (mousedown)="aoClicarFundo($event)"
    >
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="idTitulo"
        class="w-full rounded-2xl bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,.45)]"
        [class]="largura()"
      >
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5">
          <div class="flex min-w-0 flex-col gap-2">
            <h2 [id]="idTitulo" class="m-0 text-lg font-semibold">{{ titulo() }}</h2>
            <ng-content select="[subtitulo]" />
          </div>
          <button
            type="button"
            aria-label="Fechar"
            (click)="fechar.emit()"
            class="-my-2 -mr-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <app-icone nome="fechar" [tamanho]="20" />
          </button>
        </div>
        <ng-content />
      </div>
    </div>
  `,
})
export class ModalDialog {
  protected readonly idTitulo = `dlg-titulo-${proximoId++}`;

  readonly titulo = input.required<string>();
  readonly largura = input('max-w-[520px]');
  readonly topo = input('pt-[120px]');
  readonly fechar = output<void>();

  /** Clique no fundo (e não no conteúdo) fecha. Retorna void: `false` faria o Angular cancelar o foco. */
  protected aoClicarFundo(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) this.fechar.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected aoEsc(ev: Event): void {
    // Um filho (ex.: lista do combobox) pode consumir o Esc sem fechar o modal.
    if (!ev.defaultPrevented) this.fechar.emit();
  }
}
