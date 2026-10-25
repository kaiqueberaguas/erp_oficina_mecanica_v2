import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FocusTrap } from './focus-trap';

@Component({
  standalone: true,
  imports: [FocusTrap],
  template: `
    <button id="abre" type="button">abre</button>
    @if (aberto()) {
      <div appFocusTrap id="dlg">
        <button id="fecha" type="button">fechar</button>
        @if (comCampo()) {
          <input id="campo" />
        }
        <button id="ultimo" type="button">ok</button>
      </div>
    }
  `,
})
class Host {
  readonly aberto = signal(false);
  readonly comCampo = signal(true);
}

@Component({
  standalone: true,
  imports: [FocusTrap],
  template: `<div appFocusTrap id="vazio"></div>`,
})
class HostVazio {}

function montar() {
  const f = TestBed.createComponent(Host);
  document.body.appendChild(f.nativeElement);
  f.detectChanges();
  return f;
}

function tab(el: Element, shift = false) {
  const ev = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: shift,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(ev);
  return ev;
}

describe('FocusTrap', () => {
  it('foca o primeiro campo ao abrir e devolve o foco ao fechar', () => {
    const f = montar();
    const abre = f.nativeElement.querySelector('#abre') as HTMLElement;
    abre.focus();
    f.componentInstance.aberto.set(true);
    f.detectChanges();
    expect(document.activeElement?.id).toBe('campo');
    f.componentInstance.aberto.set(false);
    f.detectChanges();
    expect(document.activeElement).toBe(abre);
    f.nativeElement.remove();
  });

  it('sem campos, foca o primeiro focável', () => {
    const f = montar();
    f.componentInstance.comCampo.set(false);
    f.componentInstance.aberto.set(true);
    f.detectChanges();
    expect(document.activeElement?.id).toBe('fecha');
    f.nativeElement.remove();
  });

  it('cicla Tab e Shift+Tab nas pontas', () => {
    const f = montar();
    f.componentInstance.aberto.set(true);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const ultimo = el.querySelector('#ultimo') as HTMLElement;
    const fecha = el.querySelector('#fecha') as HTMLElement;
    ultimo.focus();
    expect(tab(ultimo).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(fecha);
    expect(tab(fecha, true).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(ultimo);
    // no meio, não interfere
    (el.querySelector('#campo') as HTMLElement).focus();
    expect(tab(document.activeElement as Element).defaultPrevented).toBe(false);
    expect(tab(document.activeElement as Element, true).defaultPrevented).toBe(false);
    f.nativeElement.remove();
  });

  it('puxa o foco de volta quando está fora do diálogo', () => {
    const f = montar();
    f.componentInstance.aberto.set(true);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    (el.querySelector('#abre') as HTMLElement).focus();
    tab(el.querySelector('#dlg') as Element);
    expect(document.activeElement?.id).toBe('fecha');
    (el.querySelector('#abre') as HTMLElement).focus();
    tab(el.querySelector('#dlg') as Element, true);
    expect(document.activeElement?.id).toBe('ultimo');
    f.nativeElement.remove();
  });

  it('sem elementos focáveis, mantém o foco no próprio contêiner', () => {
    const f = TestBed.createComponent(HostVazio);
    document.body.appendChild(f.nativeElement);
    f.detectChanges();
    const div = f.nativeElement.querySelector('#vazio') as HTMLElement;
    expect(document.activeElement).toBe(div);
    expect(tab(div).defaultPrevented).toBe(true);
    f.nativeElement.remove();
  });
});
