import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthResponse, AuthService } from './auth.service';

const resposta: AuthResponse = {
  token: 'jwt-falso',
  expiraEm: new Date(Date.now() + 3600_000).toISOString(),
  usuario: { id: 1, nome: 'Administrador', login: 'admin@oficina.com' },
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('login chama a API e guarda token e usuário no sessionStorage', () => {
    service.login('admin@oficina.com', 'Admin@123').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ login: 'admin@oficina.com', senha: 'Admin@123' });
    req.flush(resposta);

    expect(sessionStorage.getItem('erp.token')).toBe('jwt-falso');
    expect(service.usuario()?.nome).toBe('Administrador');
    expect(service.temSessaoValida()).toBe(true);
  });

  it('register envia nome, login e senha', () => {
    service.register('Ana', 'ana', '123456').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.body).toEqual({ nome: 'Ana', login: 'ana', senha: '123456' });
    req.flush({ id: 2, nome: 'Ana', login: 'ana' }, { status: 201, statusText: 'Created' });
  });

  it('restaurarSessao recupera o usuário do sessionStorage e confirma em /auth/me com Bearer', () => {
    sessionStorage.setItem('erp.token', 'jwt-falso');
    sessionStorage.setItem('erp.usuario', JSON.stringify(resposta.usuario));
    sessionStorage.setItem('erp.expiraEm', resposta.expiraEm);

    service.restaurarSessao();

    expect(service.usuario()?.login).toBe('admin@oficina.com');
    const req = http.expectOne(`${environment.apiUrl}/auth/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-falso');
    req.flush({ id: 1, nome: 'Admin Atualizado', login: 'admin@oficina.com' });
    expect(service.usuario()?.nome).toBe('Admin Atualizado');
  });

  it('restaurarSessao limpa tudo quando o token expirou, sem chamar a API', () => {
    sessionStorage.setItem('erp.token', 'jwt-falso');
    sessionStorage.setItem('erp.usuario', JSON.stringify(resposta.usuario));
    sessionStorage.setItem('erp.expiraEm', new Date(Date.now() - 1000).toISOString());

    service.restaurarSessao();

    http.expectNone(`${environment.apiUrl}/auth/me`);
    expect(service.usuario()).toBeNull();
    expect(sessionStorage.getItem('erp.token')).toBeNull();
  });

  it('401 em /auth/me limpa a sessão (interceptor)', () => {
    sessionStorage.setItem('erp.token', 'jwt-falso');
    sessionStorage.setItem('erp.usuario', JSON.stringify(resposta.usuario));
    sessionStorage.setItem('erp.expiraEm', resposta.expiraEm);

    service.restaurarSessao();
    http
      .expectOne(`${environment.apiUrl}/auth/me`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(service.usuario()).toBeNull();
    expect(sessionStorage.getItem('erp.token')).toBeNull();
  });
});
