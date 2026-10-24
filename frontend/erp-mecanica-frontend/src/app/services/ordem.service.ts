import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AtualizarEtapa, EtapaOrdem, Ordem, OrdemForm } from '../models/ordem';
import { Paged } from '../models/paged';

export interface FiltroOrdens {
  etapas?: EtapaOrdem[];
  busca?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ordens`;

  listar(filtro: FiltroOrdens = {}): Observable<Paged<Ordem>> {
    let params = new HttpParams();
    for (const etapa of filtro.etapas ?? []) params = params.append('etapa', etapa);
    if (filtro.busca) params = params.set('busca', filtro.busca);
    if (filtro.page) params = params.set('page', filtro.page);
    if (filtro.pageSize) params = params.set('pageSize', filtro.pageSize);
    return this.http.get<Paged<Ordem>>(this.apiUrl, { params });
  }

  criar(dados: OrdemForm): Observable<Ordem> {
    return this.http.post<Ordem>(this.apiUrl, dados);
  }

  editar(id: number, dados: OrdemForm): Observable<Ordem> {
    return this.http.put<Ordem>(`${this.apiUrl}/${id}`, dados);
  }

  atualizarEtapa(id: number, dados: AtualizarEtapa): Observable<Ordem> {
    return this.http.patch<Ordem>(`${this.apiUrl}/${id}/status`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
