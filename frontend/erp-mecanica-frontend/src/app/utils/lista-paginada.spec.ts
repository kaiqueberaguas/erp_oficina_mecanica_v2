import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { Paged } from '../models/paged';
import { ListaPaginada } from './lista-paginada';

const pagina = (items: number[], page = 1, total = items.length): Paged<number> => ({
  items,
  total,
  page,
  pageSize: 10,
});

describe('ListaPaginada', () => {
  it('carrega a página pedida e publica o estado', () => {
    const buscar = vi.fn((p: number) => of(pagina([1, 2], p, 12)));
    const lista = new ListaPaginada<number>(buscar);

    lista.carregar(2);

    expect(buscar).toHaveBeenCalledWith(2);
    expect(lista.itens()).toEqual([1, 2]);
    expect(lista.total()).toBe(12);
    expect(lista.pagina()).toBe(2);
    expect(lista.carregando()).toBe(false);
    expect(lista.erro()).toBe('');
  });

  it('indica carregamento enquanto a resposta não chega', () => {
    const resposta = new Subject<Paged<number>>();
    const lista = new ListaPaginada<number>(() => resposta);

    lista.carregar();
    expect(lista.carregando()).toBe(true);

    resposta.next(pagina([1]));
    expect(lista.carregando()).toBe(false);
  });

  it('recarrega a página atual por padrão e a primeira em recarregar()', () => {
    const buscar = vi.fn((p: number) => of(pagina([p], p, 30)));
    const lista = new ListaPaginada<number>(buscar);

    lista.carregar(3);
    lista.carregar();
    lista.recarregar();

    expect(buscar.mock.calls.map((c) => c[0])).toEqual([3, 3, 1]);
  });

  it('volta uma página quando a atual ficou vazia após excluir', () => {
    const buscar = vi.fn((p: number) => of(p === 2 ? pagina([], 2, 10) : pagina([9], 1, 10)));
    const lista = new ListaPaginada<number>(buscar);

    lista.carregar(2);

    expect(buscar.mock.calls.map((c) => c[0])).toEqual([2, 1]);
    expect(lista.itens()).toEqual([9]);
    expect(lista.pagina()).toBe(1);
  });

  it('mantém a lista vazia na primeira página sem registros', () => {
    const lista = new ListaPaginada<number>(() => of(pagina([], 1, 0)));

    lista.carregar(1);

    expect(lista.itens()).toEqual([]);
    expect(lista.total()).toBe(0);
  });

  it('não volta de página quando uma página > 1 vem vazia com total zero', () => {
    const buscar = vi.fn(() => of(pagina([], 2, 0)));
    const lista = new ListaPaginada<number>(buscar);

    lista.carregar(2);

    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('expõe a mensagem do erro e libera o carregamento', () => {
    const lista = new ListaPaginada<number>(() =>
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    lista.carregar();

    expect(lista.erro()).toBe('Não foi possível carregar os dados.');
    expect(lista.carregando()).toBe(false);
  });
});
