import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Prende o foco dentro do elemento (modais): foca o primeiro campo ao abrir, cicla Tab/Shift+Tab
 * e devolve o foco ao elemento que o tinha antes ao fechar.
 */
@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
  host: { '(keydown.tab)': 'ciclar($event)', '(keydown.shift.tab)': 'ciclar($event)' },
})
export class FocusTrap implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private anterior: HTMLElement | null = null;

  constructor() {
    this.anterior = document.activeElement as HTMLElement | null;
    // Depois da renderização, para que o conteúdo projetado/condicional já exista.
    afterNextRender(() => this.focarInicial());
  }

  private focarInicial(): void {
    const campo = this.el.querySelector<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    const alvo = campo ?? this.focaveis()[0] ?? this.el;
    if (alvo === this.el) this.el.tabIndex = -1;
    alvo.focus();
  }

  ngOnDestroy(): void {
    this.anterior?.focus?.();
  }

  protected ciclar(ev: Event): void {
    const itens = this.focaveis();
    if (itens.length === 0) {
      ev.preventDefault();
      return;
    }
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    const voltando = (ev as KeyboardEvent).shiftKey;
    const ativo = document.activeElement;
    if (voltando && (ativo === primeiro || !this.el.contains(ativo))) {
      ev.preventDefault();
      ultimo.focus();
    } else if (!voltando && (ativo === ultimo || !this.el.contains(ativo))) {
      ev.preventDefault();
      primeiro.focus();
    }
  }

  private focaveis(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>(FOCAVEIS));
  }
}
