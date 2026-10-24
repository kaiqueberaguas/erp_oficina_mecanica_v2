import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../components/toast/toast';
import { Carro } from '../../models/carro';
import { Cliente } from '../../models/cliente';
import { Carros } from './carros';

const urlCarros = `${environment.apiUrl}/carros`;
const urlClientes = `${environment.apiUrl}/clientes`;

const carro = (id: number, extra: Partial<Carro> = {}): Carro => ({
  id,
  clienteId: 3,
  marca: 'Fiat',
  modelo: 'Argo',
  placa: 'ABC1234',
  totalOrdens: 0,
  clienteNome: 'Ana Souza',
  ...extra,
});

const cliente = (id: number, nome = `Cliente ${id}`): Cliente => ({
  id,
  nome,
  cpf: '52998224725',
  contato: 'x@y.com',
  totalCarros: 0,
});

const pagina = <T>(items: T[], total = items.length, page = 1) => ({ items, total, page, pageSize: 10 });

describe('Carros', () => {
  let fixture: ComponentFixture<Carros>;
  let http: HttpTestingController;
  let toast: ToastService;
  const pg = () => fixture.componentInstance as any;
  const el = (): HTMLElement => fixture.nativeElement;
  const q = <T extends HTMLElement>(seletor: string) => el().querySelector<T>(seletor)!;
  const botao = (texto: string) =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim().includes(texto))!;

  const listagem = (): TestRequest => http.expectOne((r) => r.method === 'GET' && r.url === urlCarros);
  const clientes = (): TestRequest => http.expectOne((r) => r.method === 'GET' && r.url === urlClientes);
  const iniciar = (itens: Carro[] = [carro(1)], total = itens.length) => {
    fixture.detectChanges();
    listagem().flush(pagina(itens, total));
    fixture.detectChanges();
  };
  const preencher = () => {
    pg().escolherCliente(3);
    pg().aoDigitar('marca', ' Fiat ');
    pg().aoDigitar('modelo', ' Argo ');
    pg().aoDigitar('placa', 'abc1234');
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Carros],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Carros);
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  describe('listagem', () => {
    it('mostra carregando e depois os veículos com placa formatada e dono', () => {
      fixture.detectChanges();
      expect(el().textContent).toContain('Carregando veículos...');

      listagem().flush(
        pagina([carro(1, { totalOrdens: 3 }), carro(2, { totalOrdens: 1, clienteNome: null, placa: 'RIO2A18' }), carro(3)]),
      );
      fixture.detectChanges();

      const linhas = el().querySelectorAll('tbody tr');
      expect(linhas.length).toBe(3);
      expect(linhas[0].textContent).toContain('ABC-1234');
      expect(linhas[0].textContent).toContain('Ana Souza');
      expect(linhas[0].textContent).toContain('3 OS');
      expect(linhas[1].textContent).toContain('RIO2A18');
      expect(linhas[1].textContent).toContain('—');
      expect(linhas[1].textContent).toContain('1 OS');
      expect(linhas[2].textContent).toContain('Nenhuma OS');
      expect(pg().idFormatado(5)).toBe('005');
    });

    it('mostra o estado vazio e limpa a busca', () => {
      iniciar([]);

      expect(el().textContent).toContain('Nenhum veículo encontrado');
      botao('Limpar busca').click();

      expect(listagem().request.params.has('busca')).toBe(false);
    });

    it('mostra o erro de carregamento e tenta novamente', () => {
      fixture.detectChanges();
      listagem().flush({}, { status: 500, statusText: 'Erro' });
      fixture.detectChanges();

      expect(q('[role=alert]').textContent).toContain('Não foi possível carregar os dados.');
      botao('Tentar novamente').click();
      listagem().flush(pagina([carro(1)]));
    });

    it('busca no servidor após o debounce', () => {
      iniciar();
      vi.useFakeTimers();

      pg().aoDigitarBusca('ab');
      pg().aoDigitarBusca(' abc ');
      vi.advanceTimersByTime(300);

      const req = listagem();
      expect(req.request.params.get('busca')).toBe('abc');
      req.flush(pagina([carro(1)]));
    });

    it('navega entre páginas pelo servidor', () => {
      iniciar([carro(1)], 15);

      botao('Próxima').click();

      const req = listagem();
      expect(req.request.params.get('page')).toBe('2');
      req.flush(pagina([carro(11)], 15, 2));
    });
  });

  describe('formulário', () => {
    it('abre vazio, carrega os clientes e valida ao tentar salvar', () => {
      iniciar();
      botao('Novo Veículo').click();
      fixture.detectChanges();
      clientes().flush(pagina([cliente(3, 'Ana Souza'), cliente(4)]));

      expect(pg().opcoesClientes().map((o: any) => o.id)).toEqual([3, 4]);
      pg().salvarCarro();
      fixture.detectChanges();

      expect(el().textContent).toContain('Selecione o proprietário.');
      expect(el().textContent).toContain('Informe a marca.');
      expect(el().textContent).toContain('Informe o modelo.');
      expect(el().textContent).toContain('Informe a placa.');
      http.expectNone((r) => r.method === 'POST');
    });

    it('rejeita placa inválida e só mostra erro depois de tocar', () => {
      iniciar();
      pg().novoCarro();
      clientes().flush(pagina([]));
      pg().aoDigitar('placa', 'XX');

      expect(pg().erro('placa')).toBe('');
      pg().tocado.set(true);
      expect(pg().erro('placa')).toContain('Placa inválida');
      expect(pg().form().placa).toBe('XX');
    });

    it('busca clientes no servidor ao digitar no combobox (com debounce)', () => {
      iniciar();
      pg().novoCarro();
      clientes().flush(pagina([cliente(4)]));
      vi.useFakeTimers();

      pg().buscarClientes('an');
      pg().buscarClientes(' ana ');
      vi.advanceTimersByTime(300);

      const req = clientes();
      expect(req.request.params.get('busca')).toBe('ana');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush(pagina([cliente(5, 'Ana')]));
      expect(pg().opcoesClientes().map((o: any) => o.id)).toEqual([5]);
    });

    it('informa a falha ao carregar clientes', () => {
      iniciar();
      pg().novoCarro();

      clientes().flush({}, { status: 500, statusText: 'Erro' });

      expect(pg().erroApi()).toBe('Não foi possível carregar os clientes.');
    });

    it('cadastra um veículo, avisa e recarrega a lista', async () => {
      iniciar();
      pg().novoCarro();
      clientes().flush(pagina([cliente(3, 'Ana Souza')]));
      preencher();

      pg().salvarCarro();
      fixture.detectChanges();
      const req = http.expectOne((r) => r.method === 'POST' && r.url === urlCarros);
      expect(req.request.body).toEqual({ clienteId: 3, marca: 'Fiat', modelo: 'Argo', placa: 'ABC-1234' });
      pg().salvarCarro(); // ignorado enquanto salva
      req.flush(carro(9));
      fixture.detectChanges();

      expect(toast.mensagem()).toBe('Veículo cadastrado com sucesso.');
      expect(pg().mostrarModalForm()).toBe(false);
      listagem().flush(pagina([carro(9)]));
    });

    it('edita mantendo o proprietário atual nas opções', () => {
      iniciar([carro(4, { placa: 'ABC1234', clienteId: 3, clienteNome: 'Ana Souza' })]);

      q('button[aria-label="Editar veículo ABC1234"]').click();
      fixture.detectChanges();
      expect(pg().opcoesClientes()[0].rotulo).toBe('Ana Souza');
      expect(pg().form().placa).toBe('ABC-1234');
      // O proprietário atual não veio na primeira página da busca: continua selecionável.
      clientes().flush(pagina([cliente(7)]));
      expect(pg().opcoesClientes().map((o: any) => o.id)).toEqual([3, 7]);

      pg().salvarCarro();
      http.expectOne((r) => r.method === 'PUT' && r.url === `${urlCarros}/4`).flush(carro(4));

      expect(toast.mensagem()).toBe('Veículo atualizado com sucesso.');
      listagem().flush(pagina([carro(4)]));
    });

    it('edita um veículo sem nome de proprietário conhecido', () => {
      iniciar([carro(4, { clienteNome: null })]);

      pg().editarCarro(carro(4, { clienteNome: null }));
      clientes().flush(pagina([cliente(3)]));

      expect(pg().opcoesClientes().map((o: any) => o.id)).toEqual([3]);
    });

    it('mostra o erro da API (placa duplicada) e mantém o modal aberto', () => {
      iniciar();
      pg().novoCarro();
      clientes().flush(pagina([]));
      preencher();

      pg().salvarCarro();
      http
        .expectOne((r) => r.method === 'POST')
        .flush({ title: 'Já existe um carro cadastrado com esta placa.' }, { status: 409, statusText: 'Conflict' });
      fixture.detectChanges();

      expect(q('[role=alert]').textContent).toContain('Já existe um carro cadastrado com esta placa.');
      expect(pg().salvando()).toBe(false);
      expect(pg().mostrarModalForm()).toBe(true);
    });

    it('Cancelar fecha o modal', () => {
      iniciar();
      pg().novoCarro();
      clientes().flush(pagina([]));
      fixture.detectChanges();

      botao('Cancelar').click();
      fixture.detectChanges();

      expect(el().textContent).not.toContain('Cadastrar Veículo');
    });
  });

  describe('exclusão', () => {
    it('confirma, exclui e recarrega a lista', () => {
      iniciar([carro(1, { totalOrdens: 2 })]);
      q('button[aria-label="Excluir veículo ABC1234"]').click();
      fixture.detectChanges();
      expect(el().textContent).toContain('Confirmar Exclusão de Veículo');
      expect(el().textContent).toContain('2 OS');

      pg().excluirCarro();
      http.expectOne((r) => r.method === 'DELETE' && r.url === `${urlCarros}/1`).flush(null, { status: 204, statusText: 'No Content' });

      expect(toast.mensagem()).toBe('Veículo excluído.');
      expect(pg().carroSelecionado()).toBeNull();
      listagem().flush(pagina([]));
    });

    it('cancelar descarta a seleção e excluir sem seleção não faz nada', () => {
      iniciar();
      pg().abrirModalExclusao(carro(1));
      pg().cancelarExclusao();

      pg().excluirCarro();

      expect(pg().carroSelecionado()).toBeNull();
      http.expectNone((r) => r.method === 'DELETE');
    });

    it('informa a falha ao excluir', () => {
      iniciar();
      pg().abrirModalExclusao(carro(1));

      pg().excluirCarro();
      http.expectOne((r) => r.method === 'DELETE').flush({ title: 'Carro não encontrado.' }, { status: 404, statusText: 'Not Found' });

      expect(toast.mensagem()).toBe('Carro não encontrado.');
      expect(pg().carroSelecionado()).toBeNull();
    });
  });

  describe('rótulos', () => {
    it('descreve a quantidade de OS e o dono', () => {
      iniciar();

      expect(pg().rotuloOs(carro(1, { totalOrdens: 0 }))).toBe('Nenhuma OS');
      expect(pg().rotuloOs(carro(1, { totalOrdens: 1 }))).toBe('1 OS');
      expect(pg().rotuloOs(carro(1, { totalOrdens: 4 }))).toBe('4 OS');
      expect(pg().nomeDono(carro(1, { clienteNome: null }))).toBe('—');
    });
  });
});
