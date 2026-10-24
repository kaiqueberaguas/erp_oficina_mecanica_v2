import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Carro, CarroForm } from '../models/carro';
import { Paged } from '../models/paged';

export interface FiltroCarros {
  busca?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class CarroService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/carros`;

  listar(filtro: FiltroCarros = {}): Observable<Paged<Carro>> {
    let params = new HttpParams();
    if (filtro.busca) params = params.set('busca', filtro.busca);
    if (filtro.page) params = params.set('page', filtro.page);
    if (filtro.pageSize) params = params.set('pageSize', filtro.pageSize);
    return this.http.get<Paged<Carro>>(this.apiUrl, { params });
  }

  criar(dados: CarroForm): Observable<Carro> {
    return this.http.post<Carro>(this.apiUrl, dados);
  }

  editar(id: number, dados: CarroForm): Observable<Carro> {
    return this.http.put<Carro>(`${this.apiUrl}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
