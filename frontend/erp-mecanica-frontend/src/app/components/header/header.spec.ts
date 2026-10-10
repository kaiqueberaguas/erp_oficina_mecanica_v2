import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Header } from './header';

describe('Header', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('sincroniza a sessão ao carregar e exibe o usuário logado', async () => {
    sessionStorage.setItem('erp.token', 'jwt');
    sessionStorage.setItem('erp.usuario', JSON.stringify({ id: 1, nome: 'Maria', login: 'maria' }));
    sessionStorage.setItem('erp.expiraEm', new Date(Date.now() + 60_000).toISOString());

    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/me`);
    req.flush({ id: 1, nome: 'Maria', login: 'maria' });
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="usuario-logado"]',
    )?.textContent;
    expect(texto).toContain('Maria');
  });

  it('sem sessão não chama a API e não exibe usuário', async () => {
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();

    TestBed.inject(HttpTestingController).expectNone(`${environment.apiUrl}/auth/me`);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="usuario-logado"]'),
    ).toBeNull();
  });
});
