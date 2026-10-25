import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { EtapaOrdem } from '../models/ordem';
import { OrdemService } from './ordem.service';

const url = `${environment.apiUrl}/ordens`;
const dados = {
  carroId: 2,
  descricaoOrdem: 'Troca de óleo',
  valorServico: 150,
  dataEntradaCarro: '2026-10-01',
};

describe('OrdemService', () => {
  let service: OrdemService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar envia etapas repetidas, busca e paginação', () => {
    service
      .listar({
        etapas: [EtapaOrdem.Rascunho, EtapaOrdem.Inicio],
        busca: 'abc',
        page: 2,
        pageSize: 10,
      })
      .subscribe();

    const req = http.expectOne((r) => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.getAll('etapa')).toEqual(['1', '2']);
    expect(req.request.params.get('busca')).toBe('abc');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ items: [], total: 0, page: 2, pageSize: 10 });
  });

  it('listar sem filtro não envia parâmetros', () => {
    service.listar().subscribe();

    const req = http.expectOne((r) => r.url === url);
    expect(req.request.params.keys()).toEqual([]);
    req.flush({ items: [], total: 0, page: 1, pageSize: 10 });
  });

  it('criar faz POST', () => {
    service.criar(dados).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dados);
    req.flush({});
  });

  it('editar faz PUT no id', () => {
    service.editar(9, dados).subscribe();

    const req = http.expectOne(`${url}/9`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('atualizarEtapa faz PATCH em /status', () => {
    service.atualizarEtapa(9, { etapa: EtapaOrdem.Cancelada, observacao: 'Desistiu' }).subscribe();

    const req = http.expectOne(`${url}/9/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ etapa: 5, observacao: 'Desistiu' });
    req.flush({});
  });

  it('excluir faz DELETE no id', () => {
    service.excluir(9).subscribe();

    const req = http.expectOne(`${url}/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
