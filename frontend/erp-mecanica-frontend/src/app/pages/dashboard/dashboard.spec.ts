import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exibe os KPIs do mês atual', () => {
    expect(el.textContent).toContain('Visão Geral da Oficina');
    expect(el.textContent).toContain('3,2 dias');
    expect(el.textContent).toContain('100 OS');
  });

  it('troca o período e recalcula os totais', async () => {
    (component as any).periodo.set('ano');
    await fixture.whenStable();
    expect((component as any).total()).toBe(792);
    expect(el.textContent).toContain('792 OS');
  });
});
