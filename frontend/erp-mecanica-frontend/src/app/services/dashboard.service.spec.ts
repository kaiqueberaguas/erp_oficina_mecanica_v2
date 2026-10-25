import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('obter faz GET em /dashboard', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    let resposta: unknown;

    TestBed.inject(DashboardService)
      .obter()
      .subscribe((r) => (resposta = r));
    const req = http.expectOne(`${environment.apiUrl}/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({ ok: true });

    expect(resposta).toEqual({ ok: true });
    http.verify();
  });
});
