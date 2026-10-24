import { signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Paged } from '../models/paged';
import { mensagemErro } from './erro-api';

export const TAMANHO_PAGINA = 10;

/** Estado de uma listagem paginada no servidor (signals, pois o app roda sem zone.js). */
export class ListaPaginada<T> {
  readonly itens = signal<T[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly carregando = signal(false);
  readonly erro = signal('');

  constructor(private readonly buscar: (pagina: number) => Observable<Paged<T>>) {}

  carregar(pagina = this.pagina()): void {
    this.carregando.set(true);
    this.erro.set('');
    this.buscar(pagina).subscribe({
      next: (r) => {
        // Após uma exclusão a página pode ter ficado vazia: volta para a anterior.
        if (r.items.length === 0 && r.total > 0 && pagina > 1) {
          this.carregar(pagina - 1);
          return;
        }
        this.itens.set(r.items);
        this.total.set(r.total);
        this.pagina.set(r.page);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e, 'Não foi possível carregar os dados.'));
        this.carregando.set(false);
      },
    });
  }

  /** Volta para a primeira página (nova busca/filtro). */
  recarregar(): void {
    this.carregar(1);
  }
}
