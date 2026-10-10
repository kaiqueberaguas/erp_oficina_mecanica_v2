import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, publicoGuard } from './auth.guard';

describe('guards de autenticação', () => {
  const rota = {} as ActivatedRouteSnapshot;
  const estado = {} as RouterStateSnapshot;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  const executar = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard(rota, estado));

  it('authGuard bloqueia usuário não logado e redireciona para /login', () => {
    const resultado = executar(authGuard) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/login');
  });

  it('authGuard libera usuário com sessão válida', () => {
    sessionStorage.setItem('erp.token', 'jwt');
    sessionStorage.setItem('erp.expiraEm', new Date(Date.now() + 60_000).toISOString());

    expect(executar(authGuard)).toBe(true);
  });

  it('authGuard bloqueia sessão expirada', () => {
    sessionStorage.setItem('erp.token', 'jwt');
    sessionStorage.setItem('erp.expiraEm', new Date(Date.now() - 60_000).toISOString());

    expect(executar(authGuard)).toBeInstanceOf(UrlTree);
  });

  it('publicoGuard manda usuário logado para o dashboard', () => {
    sessionStorage.setItem('erp.token', 'jwt');
    sessionStorage.setItem('erp.expiraEm', new Date(Date.now() + 60_000).toISOString());

    const resultado = executar(publicoGuard) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/dashboard');
  });

  it('publicoGuard libera visitante', () => {
    expect(executar(publicoGuard)).toBe(true);
  });
});
