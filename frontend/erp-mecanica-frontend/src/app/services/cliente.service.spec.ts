import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { ClienteService } from './cliente.service';

const url = `${environment.apiUrl}/clientes`;
const dados = { nome: 'Ana', cpf: '529.982.247-25', contato: '(11) 91234-5678' };

describe('ClienteService', () => {
  let service: ClienteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClienteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar envia busca e paginação', () => {
    const pagina = { items: [], total: 0, page: 2, pageSize: 5 };
    let recebido: unknown;
    service.listar({ busca: 'ana', page: 2, pageSize: 5 }).subscribe((r) => (recebido = r));

    const req = http.expectOne((r) => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('busca')).toBe('ana');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('5');
    req.flush(pagina);

    expect(recebido).toEqual(pagina);
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
    req.flush({ id: 1, ...dados, totalCarros: 0 });
  });

  it('editar faz PUT no id', () => {
    service.editar(7, dados).subscribe();

    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dados);
    req.flush({ id: 7, ...dados, totalCarros: 0 });
  });

  it('excluir faz DELETE no id', () => {
    service.excluir(7).subscribe();

    const req = http.expectOne(`${url}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
