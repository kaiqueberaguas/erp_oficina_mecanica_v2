import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let http: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('não envia o formulário com campos obrigatórios vazios', async () => {
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectNone(`${environment.apiUrl}/auth/login`);
    expect(el.textContent).toContain('O login é obrigatório.');
    expect(el.textContent).toContain('A senha é obrigatória.');
  });

  it('chama o AuthService ao enviar credenciais e mostra erro em caso de 401', async () => {
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('#login') as HTMLInputElement).value = 'admin@oficina.com';
    el.querySelector('#login')!.dispatchEvent(new Event('input'));
    (el.querySelector('#senha') as HTMLInputElement).value = 'errada';
    el.querySelector('#senha')!.dispatchEvent(new Event('input'));

    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.body).toEqual({ login: 'admin@oficina.com', senha: 'errada' });
    req.flush({ title: 'Login ou senha inválidos.' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(el.querySelector('[data-testid="erro-login"]')?.textContent).toContain(
      'Login ou senha inválidos.',
    );
  });
});
