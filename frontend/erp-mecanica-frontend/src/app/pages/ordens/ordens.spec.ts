import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../components/toast/toast';
import { Carro } from '../../models/carro';
import { EtapaOrdem, Ordem } from '../../models/ordem';
import { hojeIso } from '../../utils/formatacao';
import { Ordens } from './ordens';

const urlOrdens = `${environment.apiUrl}/ordens`;
const urlCarros = `${environment.apiUrl}/carros`;

const ordem = (id: number, extra: Partial<Ordem> = {}): Ordem => ({
  id,
  carroId: 2,
  descricaoOrdem: 'Troca de óleo',
  valorServico: 150,
  etapa: EtapaOrdem.Rascunho,
  dataEntradaCarro: '2026-10-01',
  dataInicioServico: null,
  dataFimServico: null,
  dataRetiradaVeiculo: null,
  observacao: null,
  placa: 'ABC1234',
  marca: 'Fiat',
  modelo: 'Argo',
  clienteNome: 'Ana Souza',
  ...extra,
});

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

const pagina = <T>(items: T[], total = items.length, page = 1) => ({ items, total, page, pageSize: 10 });

const TOTAIS = { '': 5, '1,2,3': 3, '4': 1, '5': 1 } as Record<string, number>;

describe('Ordens', () => {
  let fixture: ComponentFixture<Ordens>;
  let http: HttpTestingController;
  let toast: ToastService;
  const pg = () => fixture.componentInstance as any;
  const el = (): HTMLElement => fixture.nativeElement;
  const q = <T extends HTMLElement>(seletor: string) => el().querySelector<T>(seletor)!;
  const botao = (texto: string) =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.trim().includes(texto))!;

  const lista = (): TestRequest =>
    http.expectOne((r) => r.method === 'GET' && r.url === urlOrdens && r.params.get('pageSize') === '10');
  const contagens = (totais = TOTAIS): void => {
    const reqs = http.match((r) => r.method === 'GET' && r.url === urlOrdens && r.params.get('pageSize') === '1');
    expect(reqs.length).toBe(4);
    reqs.forEach((r) => r.flush(pagina([], totais[r.request.params.getAll('etapa')?.join(',') ?? ''])));
  };
  const veiculos = (): TestRequest => http.expectOne((r) => r.method === 'GET' && r.url === urlCarros);
  const iniciar = (itens: Ordem[] = [ordem(1)]) => {
    fixture.detectChanges();
    lista().flush(pagina(itens));
    contagens();
    fixture.detectChanges();
  };
  const recarregado = (itens: Ordem[] = [ordem(1)]) => {
    lista().flush(pagina(itens));
    contagens();
  };
  const patch = () => http.expectOne((r) => r.method === 'PATCH');

  const montar = () => {
    fixture = TestBed.createComponent(Ordens);
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Ordens],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    montar();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    http.verify();
  });

  describe('colunas', () => {
    const cabecalhos = () => Array.from(el().querySelectorAll('thead th')).map((th) => th.textContent!.trim());
    const engrenagem = () => q<HTMLButtonElement>('button[aria-label="Colunas da tabela"]');

    it('separa veículo e placa em colunas próprias', () => {
      iniciar();
      expect(cabecalhos()).toEqual(['OS', 'Veículo', 'Placa', 'Cliente', 'Descrição do Serviço', 'Valor (R$)', 'Entrada', 'Status', 'Ações']);
      const celulas = el().querySelectorAll('tbody tr td');
      expect(celulas[1].textContent!.trim()).toBe('Fiat Argo');
      expect(celulas[2].textContent!.trim()).toBe('ABC-1234');
    });

    it('oculta e exibe colunas pela engrenagem e guarda a preferência', () => {
      iniciar();
      expect(el().querySelector('[role=group]')).toBeNull();
      engrenagem().click();
      fixture.detectChanges();
      expect(engrenagem().getAttribute('aria-expanded')).toBe('true');

      const caixas = el().querySelectorAll<HTMLInputElement>('[role=group] input[type=checkbox]');
      expect(caixas.length).toBe(7);
      caixas[2].click(); // Cliente
      fixture.detectChanges();
      expect(cabecalhos()).not.toContain('Cliente');
      expect(el().querySelector('tbody')!.textContent).not.toContain('Ana Souza');
      expect(localStorage.getItem('erp.ordens.colunasOcultas')).toBe('["cliente"]');

      caixas[2].click();
      fixture.detectChanges();
      expect(cabecalhos()).toContain('Cliente');
      expect(localStorage.getItem('erp.ordens.colunasOcultas')).toBe('[]');
    });

    it('oculta todas as colunas opcionais, uma a uma', () => {
      iniciar();
      pg().colunas.forEach((c: { id: string }) => pg().alternarColuna(c.id));
      fixture.detectChanges();
      expect(cabecalhos()).toEqual(['OS', 'Ações']);
    });

    it('restaura a preferência salva, ignorando ids inválidos', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [Ordens], providers: [provideHttpClient(), provideHttpClientTesting()] });
      localStorage.setItem('erp.ordens.colunasOcultas', '["placa","xyz"]');
      montar();
      iniciar();
      expect(cabecalhos()).not.toContain('Placa');
      expect(cabecalhos()).toContain('Veículo');
    });

    it.each(['{quebrado', '{"a":1}'])('usa tudo visível com preferência inválida (%s)', (salvo) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [Ordens], providers: [provideHttpClient(), provideHttpClientTesting()] });
      localStorage.setItem('erp.ordens.colunasOcultas', salvo);
      montar();
      iniciar();
      expect(cabecalhos().length).toBe(9);
    });

    it('funciona sem armazenamento disponível', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('bloqueado');
      });
      iniciar();
      pg().alternarColuna('valor');
      fixture.detectChanges();
      expect(cabecalhos()).not.toContain('Valor (R$)');
    });

    it('fecha o painel com Esc e ao clicar fora, mas não ao clicar dentro', () => {
      iniciar();
      const abrir = () => {
        if (!pg().menuColunasAberto()) engrenagem().click();
        fixture.detectChanges();
      };
      abrir();
      q('[role=group]').click();
      expect(pg().menuColunasAberto()).toBe(true);

      const esc = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
      document.dispatchEvent(esc);
      expect(esc.defaultPrevented).toBe(true);
      expect(pg().menuColunasAberto()).toBe(false);

      const escFechado = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
      document.dispatchEvent(escFechado);
      expect(escFechado.defaultPrevented).toBe(false);

      abrir();
      document.body.click();
      expect(pg().menuColunasAberto()).toBe(false);
      document.body.click(); // já fechado: nada acontece
      expect(pg().menuColunasAberto()).toBe(false);
    });
  });

  describe('listagem', () => {
    it('mostra carregando e depois as ordens com veículo, placa, cliente e contadores', () => {
      fixture.detectChanges();
      expect(el().textContent).toContain('Carregando ordens de serviço...');

      lista().flush(pagina([ordem(124, { etapa: EtapaOrdem.Finalizada }), ordem(2, { placa: null, marca: null, clienteNome: null })]));
      contagens();
      fixture.detectChanges();

      const linhas = el().querySelectorAll('tbody tr');
      expect(linhas.length).toBe(2);
      expect(linhas[0].textContent).toContain('#00124');
      expect(linhas[0].textContent).toContain('Fiat Argo');
      expect(linhas[0].textContent).toContain('ABC-1234');
      expect(linhas[0].textContent).toContain('Ana Souza');
      expect(linhas[0].textContent).toContain('Finalizada');
      expect(linhas[1].textContent).toContain('—');
      expect(el().querySelector('[role=tablist]')!.textContent).toContain('3');
      expect(pg().contar('todas')).toBe(5);
      expect(pg().contar('canceladas')).toBe(1);
    });

    it('mostra o estado vazio e limpa os filtros', () => {
      iniciar([]);
      pg().aba.set('canceladas');
      pg().busca.set('x');
      pg().buscaDigitada.set('x');

      expect(el().textContent).toContain('Nenhuma ordem encontrada');
      botao('Limpar filtros').click();

      const req = lista();
      expect(req.request.params.has('busca')).toBe(false);
      expect(req.request.params.has('etapa')).toBe(false);
      req.flush(pagina([]));
      contagens();
      expect(pg().aba()).toBe('todas');
      expect(pg().buscaDigitada()).toBe('');
    });

    it('mostra o erro de carregamento e tenta novamente', () => {
      fixture.detectChanges();
      lista().flush({}, { status: 500, statusText: 'Erro' });
      http.match((r) => r.params.get('pageSize') === '1').forEach((r) => r.flush(pagina([])));
      fixture.detectChanges();

      expect(q('[role=alert]').textContent).toContain('Não foi possível carregar os dados.');
      botao('Tentar novamente').click();
      lista().flush(pagina([ordem(1)]));
    });

    it('ignora falha ao carregar os contadores', () => {
      fixture.detectChanges();
      lista().flush(pagina([ordem(1)]));
      const reqs = http.match((r) => r.params.get('pageSize') === '1');
      reqs[0].flush({}, { status: 500, statusText: 'Erro' });

      expect(pg().contar('todas')).toBe(0);
      expect(pg().lista.erro()).toBe('');
    });

    it.each([
      ['Abertas', ['1', '2', '3']],
      ['Finalizadas', ['4']],
      ['Canceladas', ['5']],
      ['Todas', []],
    ])('a aba %s consulta as etapas %j', (rotulo, etapas) => {
      iniciar();

      Array.from(el().querySelectorAll<HTMLButtonElement>('[role=tab]'))
        .find((b) => b.textContent!.includes(rotulo))!
        .click();

      const req = lista();
      expect(req.request.params.getAll('etapa') ?? []).toEqual(etapas);
      expect(req.request.params.get('page')).toBe('1');
      req.flush(pagina([ordem(1)]));
    });

    it('busca no servidor após o debounce, atualizando os contadores', () => {
      iniciar();
      vi.useFakeTimers();

      pg().aoDigitarBusca('#0');
      pg().aoDigitarBusca(' abc ');
      vi.advanceTimersByTime(300);

      const req = lista();
      expect(req.request.params.get('busca')).toBe('abc');
      req.flush(pagina([ordem(1)]));
      const contadores = http.match((r) => r.params.get('pageSize') === '1');
      expect(contadores.every((c) => c.request.params.get('busca') === 'abc')).toBe(true);
      contadores.forEach((c) => c.flush(pagina([])));
    });

    it('navega entre páginas pelo servidor', () => {
      fixture.detectChanges();
      lista().flush(pagina([ordem(1)], 25));
      contagens();
      fixture.detectChanges();

      botao('Próxima').click();

      const req = lista();
      expect(req.request.params.get('page')).toBe('2');
      req.flush(pagina([ordem(11)], 25, 2));
    });
  });

  describe('formulário', () => {
    const preencher = () => {
      pg().escolherVeiculo(2);
      pg().aoDigitar('descricao', ' Revisão completa ');
      pg().aoDigitar('valor', '123456');
      pg().aoDigitar('data', '2026-10-05');
    };

    it('nova OS: valida, carrega veículos e só mostra erros depois de tocar', () => {
      iniciar();
      botao('Nova Ordem de Serviço').click();
      fixture.detectChanges();
      veiculos().flush(pagina([carro(2), carro(3, { clienteNome: null, placa: 'RIO2A18' })]));

      expect(pg().opcoesVeiculos().map((o: any) => o.id)).toEqual([2, 3]);
      expect(pg().opcoesVeiculos()[0].rotulo).toBe('ABC-1234 - Fiat Argo (Ana Souza)');
      expect(pg().opcoesVeiculos()[1].terciario).toBe('(—)');
      expect(pg().erro('carroId')).toBe('');

      pg().salvar();
      fixture.detectChanges();

      expect(el().textContent).toContain('Selecione o veículo.');
      expect(el().textContent).toContain('Descreva o defeito e o serviço.');
      expect(el().textContent).toContain('Informe o valor.');
      pg().aoDigitar('data', '');
      expect(pg().erro('data')).toBe('Informe a data.');
      http.expectNone((r) => r.method === 'POST');
    });

    it('cria a OS, volta para a aba Todas e recarrega', () => {
      iniciar();
      pg().aba.set('abertas');
      pg().abrirNova();
      veiculos().flush(pagina([carro(2)]));
      preencher();

      pg().salvar();
      fixture.detectChanges();
      const req = http.expectOne((r) => r.method === 'POST' && r.url === urlOrdens);
      expect(req.request.body).toEqual({
        carroId: 2,
        descricaoOrdem: 'Revisão completa',
        valorServico: 1234.56,
        dataEntradaCarro: '2026-10-05',
      });
      expect(el().textContent).toContain('Salvando...');
      pg().salvar(); // ignorado enquanto salva
      req.flush(ordem(77));
      fixture.detectChanges();

      expect(toast.mensagem()).toBe('OS #00077 aberta com sucesso.');
      expect(pg().modo()).toBeNull();
      expect(pg().aba()).toBe('todas');
      recarregado();
    });

    it('mostra o erro da API ao criar e mantém o modal aberto', () => {
      iniciar();
      pg().abrirNova();
      veiculos().flush(pagina([carro(2)]));
      preencher();

      pg().salvar();
      http
        .expectOne((r) => r.method === 'POST')
        .flush({ title: 'Carro não encontrado.' }, { status: 404, statusText: 'Not Found' });
      fixture.detectChanges();

      expect(q('[role=alert]').textContent).toContain('Carro não encontrado.');
      expect(pg().salvando()).toBe(false);
      expect(pg().modo()).toBe('nova');
    });

    it('edita a OS mantendo o veículo atual nas opções', () => {
      iniciar([ordem(8, { valorServico: 99.5, dataEntradaCarro: '2026-09-30' })]);

      q('button[aria-label="Editar OS #00008"]').click();
      fixture.detectChanges();
      expect(el().textContent).toContain('Editar Ordem de Serviço #00008');
      expect(pg().form().valor).toBe('99,50');
      expect(pg().opcoesVeiculos()[0].rotulo).toBe('ABC-1234 - Fiat Argo (Ana Souza)');
      veiculos().flush(pagina([carro(5)]));
      expect(pg().opcoesVeiculos().map((o: any) => o.id)).toEqual([2, 5]);

      pg().salvar();
      http.expectOne((r) => r.method === 'PUT' && r.url === `${urlOrdens}/8`).flush(ordem(8));

      expect(toast.mensagem()).toBe('OS #00008 atualizada.');
      recarregado([ordem(8)]);
    });

    it('busca veículos no servidor ao digitar (com debounce) e informa falhas', () => {
      iniciar();
      pg().abrirNova();
      veiculos().flush(pagina([]));
      vi.useFakeTimers();

      pg().buscarVeiculos('ab');
      pg().buscarVeiculos(' abc ');
      vi.advanceTimersByTime(300);

      const req = veiculos();
      expect(req.request.params.get('busca')).toBe('abc');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush({}, { status: 500, statusText: 'Erro' });
      expect(pg().erroApi()).toBe('Não foi possível carregar os veículos.');
    });

    it('fechar descarta o modal', () => {
      iniciar();
      pg().abrirNova();
      veiculos().flush(pagina([]));
      fixture.detectChanges();

      botao('Cancelar').click();
      fixture.detectChanges();

      expect(pg().modo()).toBeNull();
    });
  });

  describe('detalhes e timeline', () => {
    const abrir = (o: Ordem) => {
      iniciar([o]);
      pg().abrirDetalhes(o);
      fixture.detectChanges();
    };
    const passo = (chave: string) => pg().passos().find((p: any) => p.chave === chave);

    it('sem OS selecionada não há passos nem tempo de oficina', () => {
      expect(pg().passos()).toEqual([]);
      expect(pg().tempoOficina()).toBe('');
      expect(pg().travada()).toBe(false);
      expect(pg().podeEscolher(EtapaOrdem.Rascunho)).toBe(true);
    });

    it('rascunho: só dá para iniciar a manutenção', () => {
      abrir(ordem(1));

      expect(el().textContent).toContain('Detalhes da OS #00001');
      expect(el().textContent).toContain('Entrada em 01/10/2026');
      expect(passo('entrada').feito).toBe(true);
      expect(passo('inicio').podeAgir).toBe(true);
      expect(passo('fim').podeAgir).toBe(false);
      expect(passo('retirada').podeAgir).toBe(false);
      expect(passo('inicio').data).toBe('Pendente');
      expect(passo('entrada').linha).toBe('bg-slate-200');
      expect(pg().ajudaStatus()).toContain('só avança');
      expect(pg().podeEscolher(EtapaOrdem.Rascunho)).toBe(true);
      expect(pg().podeEscolher(EtapaOrdem.Cancelada)).toBe(true);
    });

    it('em andamento: dá para concluir a manutenção', () => {
      abrir(ordem(1, { etapa: EtapaOrdem.EmAndamento, dataInicioServico: '2026-10-02' }));

      expect(passo('inicio').feito).toBe(true);
      expect(passo('entrada').linha).toBe('bg-amber-600');
      expect(passo('inicio').linha).toBe('bg-slate-200');
      expect(passo('inicio').podeAgir).toBe(false);
      expect(passo('fim').podeAgir).toBe(true);
      expect(pg().podeEscolher(EtapaOrdem.Inicio)).toBe(false);
      pg().escolherStatus(EtapaOrdem.Inicio);
      expect(pg().statusSelecionado()).toBe(EtapaOrdem.EmAndamento);
    });

    it('finalizada: etapa travada, mas ainda dá para registrar a retirada', () => {
      abrir(
        ordem(1, {
          etapa: EtapaOrdem.Finalizada,
          dataInicioServico: '2026-10-02',
          dataFimServico: '2026-10-06',
        }),
      );

      expect(pg().travada()).toBe(true);
      expect(pg().ajudaStatus()).toContain('Etapa final');
      expect(pg().tempoOficina()).toBe('Tempo de oficina: 5 dia(s)');
      expect(passo('retirada').podeAgir).toBe(true);
      expect(pg().podeEscolher(EtapaOrdem.Cancelada)).toBe(false);
      pg().escolherStatus(EtapaOrdem.Cancelada);
      expect(pg().statusSelecionado()).toBe(EtapaOrdem.Finalizada);
    });

    it('cancelada: passos não realizados e motivo exibido', () => {
      abrir(ordem(1, { etapa: EtapaOrdem.Cancelada, observacao: 'Cliente desistiu' }));

      expect(passo('inicio').data).toBe('Não realizado');
      expect(passo('retirada').data).toBe('Pendente');
      expect(el().textContent).toContain('Motivo: Cliente desistiu');
    });

    it('retirada registrada aparece com a data', () => {
      abrir(ordem(1, { etapa: EtapaOrdem.Finalizada, dataInicioServico: '2026-10-02', dataFimServico: '2026-10-06', dataRetiradaVeiculo: '2026-10-08' }));

      expect(passo('retirada').data).toBe('08/10/2026');
      expect(passo('retirada').podeAgir).toBe(false);
    });

    it('descreve a ajuda de cada etapa escolhida', () => {
      abrir(ordem(1));

      pg().escolherStatus(EtapaOrdem.Finalizada);
      expect(pg().ajudaStatus()).toContain('data de fim do serviço');
      pg().escolherStatus(EtapaOrdem.Cancelada);
      expect(pg().ajudaStatus()).toContain('motivo');
      fixture.detectChanges();
      expect(q('#os-obs')).not.toBeNull();
    });

    it('iniciar manutenção envia PATCH para Em andamento e atualiza o modal', () => {
      abrir(ordem(1));

      botao('Iniciar Manutenção Hoje').click();
      const req = patch();
      expect(req.request.url).toBe(`${urlOrdens}/1/status`);
      expect(req.request.body).toEqual({ etapa: EtapaOrdem.EmAndamento });
      expect(pg().salvandoStatus()).toBe(true);
      req.flush(ordem(1, { etapa: EtapaOrdem.EmAndamento, dataInicioServico: hojeIso() }));
      fixture.detectChanges();

      expect(toast.mensagem()).toBe('Início do Serviço registrada.');
      expect(pg().alvo().etapa).toBe(EtapaOrdem.EmAndamento);
      expect(pg().statusSelecionado()).toBe(EtapaOrdem.EmAndamento);
      recarregado();
    });

    it('concluir manutenção envia PATCH para Finalizada', () => {
      abrir(ordem(1, { etapa: EtapaOrdem.EmAndamento, dataInicioServico: '2026-10-02' }));

      pg().registrarPasso('fim', 'Fim do Serviço');

      expect(patch().request.body).toEqual({ etapa: EtapaOrdem.Finalizada });
      http.match((r) => r.method === 'PATCH');
    });

    it('registrar retirada repete a etapa atual com a data de hoje', () => {
      abrir(ordem(1, { etapa: EtapaOrdem.Finalizada, dataInicioServico: '2026-10-02', dataFimServico: '2026-10-06' }));

      pg().registrarPasso('retirada', 'Retirada do Veículo');

      const req = patch();
      expect(req.request.body).toEqual({ etapa: EtapaOrdem.Finalizada, dataRetiradaVeiculo: hojeIso() });
      req.flush(ordem(1, { etapa: EtapaOrdem.Finalizada, dataRetiradaVeiculo: hojeIso() }));
      recarregado();
    });

    it('informa a falha ao registrar um passo', () => {
      abrir(ordem(1));

      pg().registrarPasso('inicio', 'Início do Serviço');
      patch().flush({ title: 'Transição inválida.' }, { status: 400, statusText: 'Bad Request' });

      expect(toast.mensagem()).toBe('Transição inválida.');
      expect(pg().salvandoStatus()).toBe(false);
    });

    describe('salvar etapa e valor', () => {
      it('não faz nada em etapa final nem enquanto salva', () => {
        abrir(ordem(1, { etapa: EtapaOrdem.Cancelada }));
        pg().salvarStatus();

        pg().alvo.set(ordem(1));
        pg().salvandoStatus.set(true);
        pg().salvarStatus();

        http.expectNone((r) => r.method !== 'GET');
      });

      it('exige o motivo para cancelar', () => {
        abrir(ordem(1));
        pg().escolherStatus(EtapaOrdem.Cancelada);

        pg().salvarStatus();
        fixture.detectChanges();

        expect(pg().erroMotivo()).toBe('Informe o motivo do cancelamento.');
        expect(el().textContent).toContain('Informe o motivo do cancelamento.');
        pg().escolherStatus(EtapaOrdem.Cancelada);
        expect(pg().erroMotivo()).toBe('');
        http.expectNone((r) => r.method !== 'GET');
      });

      it('avisa quando não há alterações', () => {
        abrir(ordem(1));

        botao('Salvar Alterações').click();

        expect(toast.mensagem()).toBe('Nenhuma alteração para salvar.');
        http.expectNone((r) => r.method !== 'GET');
      });

      it('cancela enviando o motivo', () => {
        abrir(ordem(1));
        pg().escolherStatus(EtapaOrdem.Cancelada);
        pg().motivo.set('  Cliente desistiu ');

        pg().salvarStatus();

        const req = patch();
        expect(req.request.body).toEqual({ etapa: EtapaOrdem.Cancelada, observacao: 'Cliente desistiu' });
        req.flush(ordem(1, { etapa: EtapaOrdem.Cancelada, observacao: 'Cliente desistiu' }));
        expect(toast.mensagem()).toBe('OS #00001 salva.');
        recarregado();
      });

      it('avança de etapa sem observação', () => {
        abrir(ordem(1));
        pg().escolherStatus(EtapaOrdem.Finalizada);

        pg().salvarStatus();

        expect(patch().request.body).toEqual({ etapa: EtapaOrdem.Finalizada });
        http.match((r) => r.method === 'PATCH');
      });

      it('reajusta só o valor com PUT, sem mudar a etapa', () => {
        abrir(ordem(1, { valorServico: 150 }));
        pg().aoDigitarReajuste('20000');
        expect(pg().valorReajustado()).toBe('200,00');

        pg().salvarStatus();

        const req = http.expectOne((r) => r.method === 'PUT' && r.url === `${urlOrdens}/1`);
        expect(req.request.body).toEqual({
          carroId: 2,
          descricaoOrdem: 'Troca de óleo',
          valorServico: 200,
          dataEntradaCarro: '2026-10-01',
        });
        req.flush(ordem(1, { valorServico: 200 }));
        http.expectNone((r) => r.method === 'PATCH');
        expect(pg().alvo().valorServico).toBe(200);
        recarregado();
      });

      it('reajusta o valor e depois muda a etapa', () => {
        abrir(ordem(1, { valorServico: 150 }));
        pg().aoDigitarReajuste('30000');
        pg().escolherStatus(EtapaOrdem.Finalizada);

        pg().salvarStatus();

        http.expectOne((r) => r.method === 'PUT').flush(ordem(1, { valorServico: 300 }));
        patch().flush(ordem(1, { valorServico: 300, etapa: EtapaOrdem.Finalizada }));
        expect(pg().alvo().etapa).toBe(EtapaOrdem.Finalizada);
        recarregado();
      });

      it('valor zerado ou igual ao atual não é reenviado', () => {
        abrir(ordem(1, { valorServico: 150 }));
        pg().valorReajustado.set('');
        pg().escolherStatus(EtapaOrdem.Inicio);

        pg().salvarStatus();

        expect(patch().request.body).toEqual({ etapa: EtapaOrdem.Inicio });
        http.match((r) => r.method === 'PATCH');
      });

      it('informa a falha ao salvar', () => {
        abrir(ordem(1));
        pg().escolherStatus(EtapaOrdem.Finalizada);

        pg().salvarStatus();
        patch().error(new ProgressEvent('error'));

        expect(toast.mensagem()).toBe('Sem conexão com o servidor.');
        expect(pg().salvandoStatus()).toBe(false);
      });
    });

    it('Fechar encerra o modal de detalhes', () => {
      abrir(ordem(1));

      botao('Fechar').click();
      fixture.detectChanges();

      expect(pg().modo()).toBeNull();
    });
  });

  describe('exclusão', () => {
    it('confirma, exclui e recarrega a lista', () => {
      iniciar([ordem(3)]);
      q('button[aria-label="Excluir OS #00003"]').click();
      fixture.detectChanges();
      expect(el().textContent).toContain('Excluir Ordem de Serviço');
      expect(el().textContent).toContain('#00003');

      pg().excluir();
      http.expectOne((r) => r.method === 'DELETE' && r.url === `${urlOrdens}/3`).flush(null, { status: 204, statusText: 'No Content' });

      expect(toast.mensagem()).toBe('OS #00003 excluída.');
      expect(pg().modo()).toBeNull();
      recarregado([]);
    });

    it('informa a falha ao excluir', () => {
      iniciar([ordem(3)]);
      pg().abrirExcluir(ordem(3));

      pg().excluir();
      http.expectOne((r) => r.method === 'DELETE').flush({ title: 'Ordem de serviço não encontrada.' }, { status: 404, statusText: 'Not Found' });

      expect(toast.mensagem()).toBe('Ordem de serviço não encontrada.');
      expect(pg().modo()).toBeNull();
    });

    it('Cancelar descarta o modal de exclusão', () => {
      iniciar([ordem(3)]);
      pg().abrirExcluir(ordem(3));
      fixture.detectChanges();

      botao('Cancelar').click();
      fixture.detectChanges();

      expect(pg().modo()).toBeNull();
    });
  });
});
