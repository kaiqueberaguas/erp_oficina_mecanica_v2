import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CarroService } from './carro.service';

const url = `${environment.apiUrl}/carros`;
const dados = { clienteId: 3, marca: 'Fiat', modelo: 'Argo', placa: 'ABC-1234' };

describe('CarroService', () => {
  let service: CarroService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CarroService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar envia busca e paginação', () => {
    service.listar({ busca: 'abc', page: 3, pageSize: 20 }).subscribe();

    const req = http.expectOne((r) => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('busca')).toBe('abc');
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('pageSize')).toBe('20');
    req.flush({ items: [], total: 0, page: 3, pageSize: 20 });
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
    req.flush({ id: 1, ...dados, totalOrdens: 0, clienteNome: 'Ana' });
  });

  it('editar faz PUT no id', () => {
    service.editar(4, dados).subscribe();

    const req = http.expectOne(`${url}/4`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 4, ...dados, totalOrdens: 0, clienteNome: 'Ana' });
  });

  it('excluir faz DELETE no id', () => {
    service.excluir(4).subscribe();

    const req = http.expectOne(`${url}/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
