import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clientes } from './clientes';

describe('Clientes', () => {
  let component: Clientes;
  let fixture: ComponentFixture<Clientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientes],
    }).compileComponents();

    fixture = TestBed.createComponent(Clientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com clientes carregados', () => {
    expect((component as any).clientes.length).toBeGreaterThan(0);
  });

  it('deve iniciar com busca vazia', () => {
    expect((component as any).busca()).toBe('');
  });

  it('deve filtrar clientes pelo nome', () => {
    (component as any).busca.set('João');

    const resultado =
      (component as any).clientesFiltrados();

    expect(resultado.length).toBe(1);

    expect(resultado[0].nome)
      .toContain('João');
  });

  it('deve abrir o modal de exclusão', () => {
    const cliente =
      (component as any).clientes[0];

    (component as any)
      .abrirModalExclusao(cliente);

    expect(
      (component as any)
        .mostrarModalExclusao
    ).toBeTruthy();

    expect(
      (component as any)
        .clienteSelecionado
    ).toEqual(cliente);
  });

  it('deve fechar o modal de exclusão', () => {
    const cliente =
      (component as any).clientes[0];

    (component as any)
      .abrirModalExclusao(cliente);

    (component as any)
      .cancelarExclusao();

    expect(
      (component as any)
        .mostrarModalExclusao
    ).toBeFalsy();

    expect(
      (component as any)
        .clienteSelecionado
    ).toBeNull();
  });
});
