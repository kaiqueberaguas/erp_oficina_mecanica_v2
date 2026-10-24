import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paginacao } from './paginacao';

describe('Paginacao', () => {
  let fixture: ComponentFixture<Paginacao>;
  let paginas: number[];

  const configurar = (pagina: number, total: number, itens: number) => {
    fixture.componentRef.setInput('pagina', pagina);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('itensNaPagina', itens);
    fixture.componentRef.setInput('rotulo', 'clientes');
    fixture.detectChanges();
  };

  const botao = (texto: string) =>
    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(
      (b) => b.textContent!.trim() === texto,
    )!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Paginacao] });
    fixture = TestBed.createComponent(Paginacao);
    paginas = [];
    fixture.componentInstance.paginaChange.subscribe((p) => paginas.push(p));
  });

  it('mostra o resumo e desabilita Anterior na primeira página', () => {
    configurar(1, 25, 10);

    expect(fixture.nativeElement.textContent).toContain('Mostrando 10 de 25 clientes');
    expect(botao('Anterior').disabled).toBe(true);
    expect(botao('Próxima').disabled).toBe(false);
  });

  it('emite a página seguinte e a anterior', () => {
    configurar(2, 25, 10);

    botao('Próxima').click();
    botao('Anterior').click();

    expect(paginas).toEqual([3, 1]);
  });

  it('desabilita Próxima na última página', () => {
    configurar(3, 25, 5);

    expect(botao('Próxima').disabled).toBe(true);
  });
});
