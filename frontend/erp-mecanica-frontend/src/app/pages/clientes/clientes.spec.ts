import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../components/toast/toast';
import { Cliente } from '../../models/cliente';
import { Clientes } from './clientes';

const url = `${environment.apiUrl}/clientes`;

const cliente = (id: number, extra: Partial<Cliente> = {}): Cliente => ({
  id,
  nome: `Cliente ${id}`,
  cpf: '52998224725',
  contato: '(11) 91234-5678',
  totalCarros: 0,
  ...extra,
});

const pagina = (items: Cliente[], total = items.length, page = 1) => ({ items, total, page, pageSize: 10 });

describe('Clientes', () => {
  let fixture: ComponentFixture<Clientes>;
  let http: HttpTestingController;
  let toast: ToastService;
  // Os membros da página são protegidos; o teste os exercita diretamente quando o DOM não ajuda.
  const pagina$ = () => fixture.componentInstance as any;
  const el = (): HTMLElement => fixture.nativeElement;
  const q = <T extends HTMLElement>(seletor: string) => el().querySelector<T>(seletor)!;
  const botao = (texto: string) =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim().includes(texto))!;

  const listagem = (): TestRequest => http.expectOne((r) => r.method === 'GET' && r.url === url);
  const iniciar = (itens: Cliente[] = [cliente(1)], total = itens.length) => {
    fixture.detectChanges();
    listagem().flush(pagina(itens, total));
    fixture.detectChanges();
  };
  const digitar = async (seletor: string, valor: string) => {
    const campo = q<HTMLInputElement>(seletor);
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Clientes],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Clientes);
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  describe('listagem', () => {
    it('mostra carregando e depois os clientes do servidor', () => {
      fixture.detectChanges();
      expect(el().textContent).toContain('Carregando clientes...');

      listagem().flush(pagina([cliente(1, { totalCarros: 2 }), cliente(2, { totalCarros: 1 }), cliente(3)], 3));
      fixture.detectChanges();

      const linhas = el().querySelectorAll('tbody tr');
      expect(linhas.length).toBe(3);
      expect(linhas[0].textContent).toContain('001');
      expect(linhas[0].textContent).toContain('529.982.247-25');
      expect(linhas[0].textContent).toContain('2 veículos');
      expect(linhas[1].textContent).toContain('1 veículo');
      expect(linhas[2].textContent).toContain('Nenhum');
      expect(el().textContent).toContain('Mostrando 3 de 3 clientes');
    });

    it('mostra o estado vazio e permite limpar a busca ou cadastrar', () => {
      iniciar([]);

      expect(el().textContent).toContain('Nenhum cliente encontrado');
      botao('Limpar busca').click();
      listagem().flush(pagina([]));
      fixture.detectChanges();

      botao('+ Novo Cliente').click();
      fixture.detectChanges();
      expect(el().textContent).toContain('Cadastrar Novo Cliente');
    });

    it('mostra o erro de carregamento e tenta novamente', () => {
      fixture.detectChanges();
      listagem().flush({}, { status: 500, statusText: 'Erro' });
      fixture.detectChanges();

      expect(q('[role=alert]').textContent).toContain('Não foi possível carregar os dados.');
      botao('Tentar novamente').click();
      listagem().flush(pagina([cliente(1)]));
      fixture.detectChanges();

      expect(el().querySelectorAll('tbody tr').length).toBe(1);
    });

    it('busca no servidor após o debounce, aparando o texto', async () => {
      iniciar();
      vi.useFakeTimers();

      pagina$().aoDigitarBusca('an');
      pagina$().aoDigitarBusca('  ana ');
      expect(pagina$().buscaDigitada()).toBe('  ana ');
      http.expectNone((r) => r.method === 'GET');
      vi.advanceTimersByTime(300);

      const req = listagem();
      expect(req.request.params.get('busca')).toBe('ana');
      expect(req.request.params.get('page')).toBe('1');
      req.flush(pagina([cliente(5)]));
    });

    it('limparBusca zera o campo e recarrega sem filtro', () => {
      iniciar();
      pagina$().buscaDigitada.set('ana');
      pagina$().busca.set('ana');

      pagina$().limparBusca();

      const req = listagem();
      expect(req.request.params.has('busca')).toBe(false);
      expect(pagina$().buscaDigitada()).toBe('');
      req.flush(pagina([cliente(1)]));
    });

    it('navega entre páginas pelo servidor', () => {
      iniciar([cliente(1)], 25);

      botao('Próxima').click();

      const req = listagem();
      expect(req.request.params.get('page')).toBe('2');
      req.flush(pagina([cliente(11)], 25, 2));
      fixture.detectChanges();
      expect(el().textContent).toContain('Cliente 11');
    });
  });

  describe('formulário', () => {
    it('valida os campos ao tentar salvar vazio, sem chamar a API', () => {
      iniciar();
      botao('Novo Cliente').click();
      fixture.detectChanges();

      pagina$().salvarCliente();
      fixture.detectChanges();

      expect(el().textContent).toContain('Informe o nome do cliente.');
      expect(el().textContent).toContain('Informe o CPF.');
      expect(el().textContent).toContain('Informe um telefone ou e-mail.');
      http.expectNone((r) => r.method === 'POST');
    });

    it.each([
      ['cpf', '111.111.111-11', 'cpf', 'CPF inválido.'],
      ['contato', 'a@b', 'contato', 'E-mail inválido.'],
      ['contato', '(11) 9123', 'contato', 'Telefone incompleto.'],
    ] as const)('rejeita %s inválido (%s)', (campo, valor, chave, mensagem) => {
      iniciar();
      pagina$().novoCliente();
      pagina$().aoDigitar(campo, valor);
      pagina$().tocado.set(true);

      expect(pagina$().erro(chave)).toBe(mensagem);
    });

    it('aceita e-mail válido e não mostra erro antes de tocar', () => {
      iniciar();
      pagina$().novoCliente();
      pagina$().aoDigitar('nome', 'Ana');
      pagina$().aoDigitar('cpf', '52998224725');
      pagina$().aoDigitar('contato', 'ana@email.com');

      expect(pagina$().form().cpf).toBe('529.982.247-25');
      expect(pagina$().erros()).toEqual({ nome: '', cpf: '', contato: '' });
      pagina$().tocado.set(false);
      expect(pagina$().erro('nome')).toBe('');
    });

    it('cadastra um cliente, avisa e recarrega a lista', async () => {
      iniciar();
      botao('Novo Cliente').click();
      fixture.detectChanges();
      await fixture.whenStable();

      await digitar('#c-nome', '  Ana Souza ');
      await digitar('#c-cpf', '52998224725');
      await digitar('#c-contato', '11912345678');
      q<HTMLButtonElement>('button[type=submit]').click();
      fixture.detectChanges();

      const req = http.expectOne((r) => r.method === 'POST');
      expect(req.request.body).toEqual({ nome: 'Ana Souza', cpf: '529.982.247-25', contato: '(11) 91234-5678' });
      expect(el().textContent).toContain('Salvando...');
      pagina$().salvarCliente(); // duplo clique é ignorado enquanto salva
      req.flush(cliente(9));
      fixture.detectChanges();

      expect(toast.mensagem()).toBe('Cliente cadastrado com sucesso.');
      expect(el().textContent).not.toContain('Cadastrar Novo Cliente');
      listagem().flush(pagina([cliente(9)]));
    });

    it('edita um cliente existente com o CPF mascarado', async () => {
      iniciar([cliente(4, { nome: 'Bruno', cpf: '52998224725' })]);
      q('button[aria-label="Editar Bruno"]').click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(el().textContent).toContain('Editar Cliente');
      expect(q<HTMLInputElement>('#c-cpf').value).toBe('529.982.247-25');
      pagina$().salvarCliente();
      fixture.detectChanges();

      const req = http.expectOne((r) => r.method === 'PUT' && r.url === `${url}/4`);
      req.flush(cliente(4));
      expect(toast.mensagem()).toBe('Cliente atualizado com sucesso.');
      listagem().flush(pagina([cliente(4)]));
    });

    it('mostra o erro da API (CPF duplicado) e mantém o modal aberto', () => {
      iniciar();
      pagina$().novoCliente();
      pagina$().aoDigitar('nome', 'Ana');
      pagina$().aoDigitar('cpf', '52998224725');
      pagina$().aoDigitar('contato', 'ana@email.com');

      pagina$().salvarCliente();
      http
        .expectOne((r) => r.method === 'POST')
        .flush({ title: 'Já existe um cliente cadastrado com este CPF.' }, { status: 409, statusText: 'Conflict' });
      fixture.detectChanges();

      expect(q('[role=alert]').textContent).toContain('Já existe um cliente cadastrado com este CPF.');
      expect(pagina$().salvando()).toBe(false);
      expect(pagina$().mostrarModalForm()).toBe(true);
    });

    it('usa a mensagem padrão quando a API não explica o erro', () => {
      iniciar();
      pagina$().novoCliente();
      pagina$().aoDigitar('nome', 'Ana');
      pagina$().aoDigitar('cpf', '52998224725');
      pagina$().aoDigitar('contato', 'ana@email.com');

      pagina$().salvarCliente();
      http.expectOne((r) => r.method === 'POST').error(new ProgressEvent('error'));

      expect(pagina$().erroApi()).toBe('Sem conexão com o servidor.');
    });

    it('Cancelar fecha o modal', () => {
      iniciar();
      pagina$().novoCliente();
      fixture.detectChanges();

      botao('Cancelar').click();
      fixture.detectChanges();

      expect(el().textContent).not.toContain('Cadastrar Novo Cliente');
    });
  });

  describe('exclusão', () => {
    it('confirma, exclui e recarrega a lista', () => {
      iniciar([cliente(1, { nome: 'Ana', totalCarros: 2 })]);
      q('button[aria-label="Excluir Ana"]').click();
      fixture.detectChanges();
      expect(el().textContent).toContain('Confirmar Exclusão de Cliente');
      expect(el().textContent).toContain('2 veículos');

      pagina$().excluirCliente();
      http.expectOne((r) => r.method === 'DELETE' && r.url === `${url}/1`).flush(null, { status: 204, statusText: 'No Content' });
      fixture.detectChanges();

      expect(toast.mensagem()).toBe('Cliente excluído.');
      expect(pagina$().clienteSelecionado()).toBeNull();
      listagem().flush(pagina([]));
    });

    it('cancelar descarta a seleção', () => {
      iniciar();
      pagina$().abrirModalExclusao(cliente(1));
      pagina$().cancelarExclusao();

      expect(pagina$().clienteSelecionado()).toBeNull();
    });

    it('excluirCliente sem seleção não faz nada', () => {
      iniciar();

      pagina$().excluirCliente();

      http.expectNone((r) => r.method === 'DELETE');
    });

    it('informa a falha ao excluir', () => {
      iniciar();
      pagina$().abrirModalExclusao(cliente(1));

      pagina$().excluirCliente();
      http.expectOne((r) => r.method === 'DELETE').flush({ title: 'Cliente não encontrado.' }, { status: 404, statusText: 'Not Found' });

      expect(toast.mensagem()).toBe('Cliente não encontrado.');
      expect(pagina$().clienteSelecionado()).toBeNull();
    });
  });

  it('formata o id com três dígitos', () => {
    iniciar();

    expect(pagina$().idFormatado(7)).toBe('007');
  });
});
