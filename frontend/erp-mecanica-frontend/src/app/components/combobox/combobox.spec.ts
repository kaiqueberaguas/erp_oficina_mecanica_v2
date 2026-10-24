import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Combobox, OpcaoCombobox } from './combobox';

const opcoes: OpcaoCombobox[] = [
  { id: 1, rotulo: 'Ana Souza', busca: 'Ana Souza 529.982.247-25', principal: 'Ana Souza', terciario: '529.982.247-25' },
  { id: 2, rotulo: 'ABC-1234 - Fiat Argo', busca: 'ABC1234 Fiat Argo', principal: 'ABC-1234', secundario: 'Fiat Argo', mono: true },
];

describe('Combobox', () => {
  let fixture: ComponentFixture<Combobox>;
  let escolhidos: (number | null)[];
  let buscas: string[];

  const campo = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const itens = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('li'));
  const digitar = (texto: string) => {
    campo().value = texto;
    campo().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Combobox] });
    fixture = TestBed.createComponent(Combobox);
    escolhidos = [];
    buscas = [];
    fixture.componentInstance.valorChange.subscribe((v) => escolhidos.push(v));
    fixture.componentInstance.buscaChange.subscribe((t) => buscas.push(t));
    fixture.componentRef.setInput('opcoes', opcoes);
    fixture.detectChanges();
  });

  it('começa fechado e mostra o rótulo do valor selecionado', () => {
    fixture.componentRef.setInput('valor', 2);
    fixture.detectChanges();

    expect(itens().length).toBe(0);
    expect(campo().value).toBe('ABC-1234 - Fiat Argo');
  });

  it('abre a lista ao focar e ao clicar', () => {
    campo().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(itens().length).toBe(2);

    campo().dispatchEvent(new Event('keydown.escape'));
    campo().click();
    fixture.detectChanges();
    expect(itens().length).toBe(2);
  });

  it('filtra ao digitar, ignorando acento e pontuação, e avisa a busca', () => {
    digitar('529982');
    expect(itens().length).toBe(1);

    digitar('abc1234');
    expect(itens().length).toBe(1);
    expect(buscas).toEqual(['529982', 'abc1234']);
    expect(escolhidos).toEqual([null, null]);
  });

  it('mostra a mensagem quando nada combina', () => {
    fixture.componentRef.setInput('semResultado', 'Nenhum cliente.');
    digitar('zzz');

    expect(itens().length).toBe(1);
    expect(itens()[0].textContent).toContain('Nenhum cliente.');
  });

  it('lista tudo quando o texto é vazio', () => {
    digitar('');

    expect(itens().length).toBe(2);
  });

  it('escolhe uma opção e fecha a lista', () => {
    campo().dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const botao = itens()[1].querySelector('button')!;
    botao.dispatchEvent(new MouseEvent('mousedown', { cancelable: true }));
    botao.click();
    fixture.detectChanges();

    expect(escolhidos).toEqual([2]);
    expect(itens().length).toBe(0);
  });

  it('Esc fecha apenas a lista aberta', () => {
    campo().dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const aberto = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    campo().dispatchEvent(aberto);
    fixture.detectChanges();
    expect(aberto.defaultPrevented).toBe(true);
    expect(itens().length).toBe(0);

    const fechado = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    campo().dispatchEvent(fechado);
    expect(fechado.defaultPrevented).toBe(false);
  });

  it('reiniciar limpa o texto digitado e fecha a lista', () => {
    digitar('xyz');

    fixture.componentInstance.reiniciar();
    fixture.detectChanges();

    expect(campo().value).toBe('');
    expect(itens().length).toBe(0);
  });

  it('marca o campo com erro', () => {
    fixture.componentRef.setInput('erro', true);
    fixture.detectChanges();

    expect(campo().className).toContain('border-rose-600');
  });
});
