import { Component, Injectable, inject, signal } from '@angular/core';
import { Icone } from '../icone';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly mensagem = signal('');
  private timer?: ReturnType<typeof setTimeout>;

  mostrar(mensagem: string): void {
    this.mensagem.set(mensagem);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.mensagem.set(''), 2800);
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [Icone],
  template: `
    @if (toast.mensagem(); as texto) {
      <div
        role="status"
        class="fixed right-6 bottom-6 z-30 flex items-center gap-2.5 rounded-[10px] bg-slate-900 px-4 py-3 text-sm text-slate-50 shadow-[0_12px_32px_-8px_rgba(15,23,42,.4)]"
      >
        <span class="text-emerald-300"><app-icone nome="check" [espessura]="2.5" /></span>
        {{ texto }}
      </div>
    }
  `,
})
export class Toast {
  protected readonly toast = inject(ToastService);
}
