import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Dashboard as DashboardDados } from '../../models/dashboard';
import { Dashboard } from './dashboard';

const url = `${environment.apiUrl}/dashboard`;

const DADOS: DashboardDados = {
  kpis: { faturamentoTotal: 45800, ticketMedio: 458, tempoMedioReparoDias: 3.2, totalOrdens: 100 },
  statusDistribuicao: [
    { status: 'rascunho', quantidade: 10 },
    { status: 'emandamento', quantidade: 5 },
    { status: 'finalizada', quantidade: 80 },
    { status: 'cancelada', quantidade: 5 },
  ],
  faturamentoMensal: [
    { mes: 'Jan/2026', valor: 12000, quantidade: 25 },
    { mes: 'Fev/2026', valor: 15500, quantidade: 32 },
  ],
  topMarcas: [
    { marca: 'Volkswagen', totalOS: 28 },
    { marca: 'Fiat', totalOS: 14 },
  ],
};

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Dashboard);
    el = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  const responder = async (dados: DashboardDados) => {
    http.expectOne(url).flush(dados);
    await fixture.whenStable();
  };

  it('renderiza os valores dos KPIs, status, meses e marcas', async () => {
    await responder(DADOS);

    const texto = el.textContent!;
    expect(texto).toContain('Visão Geral da Oficina');
    expect(texto).toContain('3,2 dias');
    expect(texto).toContain('100 OS');
    expect(texto).toContain('15 abertas');
    expect(texto).toContain('80 finalizadas');
    expect(texto).toContain('5 canceladas');
    expect(texto).toContain('Jan/2026');
    expect(texto).toContain('Volkswagen');
    expect(texto).toContain('28 OS');
    expect(el.querySelectorAll('[role=img]').length).toBe(2);
  });

  it('trata dashboard vazio sem gráficos', async () => {
    await responder({
      kpis: { faturamentoTotal: 0, ticketMedio: 0, tempoMedioReparoDias: 0, totalOrdens: 0 },
      statusDistribuicao: [],
      faturamentoMensal: [],
      topMarcas: [],
    });

    expect(el.textContent).toContain('Nenhum dado cadastrado');
    expect(el.textContent).toContain('0 OS');
    expect(el.querySelectorAll('[role=img]').length).toBe(0);
  });

  it('sem ordens finalizadas mostra aviso no gráfico mensal e usa eixo padrão', async () => {
    await responder({
      kpis: { faturamentoTotal: 0, ticketMedio: 0, tempoMedioReparoDias: 0, totalOrdens: 2 },
      statusDistribuicao: [{ status: 'rascunho', quantidade: 2 }],
      faturamentoMensal: [],
      topMarcas: [{ marca: 'Fiat', totalOS: 2 }],
    });

    expect(el.textContent).toContain('Nenhuma ordem finalizada ainda');
    expect(el.textContent).toContain('2 abertas');
  });

  it('exibe a mensagem de erro da API', async () => {
    http.expectOne(url).flush({ title: 'Falhou' }, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(el.querySelector('[role=alert]')?.textContent).toContain('Falhou');
  });

  it('erro sem corpo usa a mensagem padrão', async () => {
    http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(el.querySelector('[role=alert]')?.textContent).toContain('Não foi possível carregar o dashboard.');
  });
});
