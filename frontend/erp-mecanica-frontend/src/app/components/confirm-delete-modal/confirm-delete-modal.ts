import { Component, HostListener, input, output } from '@angular/core';
import { FocusTrap } from '../focus-trap';
import { Icone } from '../icone';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [Icone, FocusTrap],
  template: `
    <div
      class="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 pt-8 pb-10 sm:pt-[140px] backdrop-blur-[3px]"
      (mousedown)="aoClicarFundo($event)"
    >
      <div
        appFocusTrap
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-titulo"
        aria-describedby="del-msg"
        class="flex w-full max-w-[480px] flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_24px_64px_-16px_rgba(15,23,42,.45)]"
      >
        <div class="flex items-start gap-3.5">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700"
          >
            <app-icone nome="alerta" [tamanho]="22" />
          </span>
          <div class="flex flex-col gap-1.5">
            <h2 id="del-titulo" class="m-0 text-lg font-semibold">{{ titulo() }}</h2>
            <p class="m-0 text-sm text-slate-600"><ng-content select="[resumo]" /></p>
          </div>
        </div>
        <p
          id="del-msg"
          class="m-0 rounded-[10px] border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-[1.55] text-rose-900"
        >
          <ng-content select="[aviso]" />
        </p>
        <div class="flex justify-end gap-2.5">
          <button
            type="button"
            (click)="cancelar.emit()"
            class="h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-[18px] text-[15px] font-medium hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="confirmar.emit()"
            class="h-11 cursor-pointer rounded-lg bg-rose-600 px-[18px] text-[15px] font-semibold text-white hover:bg-rose-700"
          >
            {{ rotuloConfirmar() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDeleteModal {
  readonly titulo = input.required<string>();
  readonly rotuloConfirmar = input('Excluir Definitivamente');
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  /** Clique no fundo (e não no conteúdo) fecha. Retorna void: `false` faria o Angular cancelar o foco. */
  protected aoClicarFundo(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) this.cancelar.emit();
  }

  @HostListener('document:keydown.escape')
  protected aoEsc(): void {
    this.cancelar.emit();
  }
}
