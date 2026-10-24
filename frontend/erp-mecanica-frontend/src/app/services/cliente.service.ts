import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente, ClienteForm } from '../models/cliente';
import { Paged } from '../models/paged';

export interface FiltroClientes {
  busca?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  listar(filtro: FiltroClientes = {}): Observable<Paged<Cliente>> {
    let params = new HttpParams();
    if (filtro.busca) params = params.set('busca', filtro.busca);
    if (filtro.page) params = params.set('page', filtro.page);
    if (filtro.pageSize) params = params.set('pageSize', filtro.pageSize);
    return this.http.get<Paged<Cliente>>(this.apiUrl, { params });
  }

  criar(dados: ClienteForm): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, dados);
  }

  editar(id: number, dados: ClienteForm): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
