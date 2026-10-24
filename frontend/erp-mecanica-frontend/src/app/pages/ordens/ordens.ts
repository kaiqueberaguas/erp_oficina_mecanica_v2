import { Component, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { Combobox, OpcaoCombobox } from '../../components/combobox/combobox';
import { ConfirmDeleteModal } from '../../components/confirm-delete-modal/confirm-delete-modal';
import { Icone } from '../../components/icone';
import { ModalDialog } from '../../components/modal-dialog/modal-dialog';
import { Paginacao } from '../../components/paginacao/paginacao';
import { STATUS_ORDEM, StatusBadge } from '../../components/status-badge/status-badge';
import { ToastService } from '../../components/toast/toast';
import { Carro } from '../../models/carro';
import { EtapaOrdem, Ordem } from '../../models/ordem';
import { CarroService } from '../../services/carro.service';
import { OrdemService } from '../../services/ordem.service';
import { mensagemErro } from '../../utils/erro-api';
import { dataBr, hojeIso, lerMoeda, maskMoeda, maskPlaca, moeda, numero2 } from '../../utils/formatacao';
import { ListaPaginada, TAMANHO_PAGINA } from '../../utils/lista-paginada';

type Aba = 'todas' | 'abertas' | 'finalizadas' | 'canceladas';
type Modo = 'nova' | 'editar' | 'detalhes' | 'excluir' | null;
type CampoForm = 'carroId' | 'descricao' | 'valor' | 'data';
type PassoChave = 'entrada' | 'inicio' | 'fim' | 'retirada';

interface FormOrdem {
  carroId: number | null;
  descricao: string;
  valor: string;
  data: string;
}

/** Etapas (query `etapa`) que cada aba consulta; "Todas" não filtra. */
const ETAPAS_DA_ABA: Record<Aba, EtapaOrdem[]> = {
  todas: [],
  abertas: [EtapaOrdem.Rascunho, EtapaOrdem.Inicio, EtapaOrdem.EmAndamento],
  finalizadas: [EtapaOrdem.Finalizada],
  canceladas: [EtapaOrdem.Cancelada],
};

const PASSOS: {
  chave: PassoChave;
  rotulo: string;
  cor: string;
  borda: string;
  campo: string;
  botao: string;
  data: (o: Ordem) => string | null;
}[] = [
  { chave: 'entrada', rotulo: 'Entrada do Veículo', cor: 'bg-emerald-600', borda: 'border-emerald-600', campo: 'data_entrada_carro', botao: '', data: (o) => o.dataEntradaCarro },
  { chave: 'inicio', rotulo: 'Início do Serviço', cor: 'bg-amber-600', borda: 'border-amber-600', campo: 'data_inicio_servico', botao: 'Iniciar Manutenção Hoje', data: (o) => o.dataInicioServico },
  { chave: 'fim', rotulo: 'Fim do Serviço', cor: 'bg-blue-600', borda: 'border-blue-600', campo: 'data_fim_servico', botao: 'Concluir Manutenção', data: (o) => o.dataFimServico },
  { chave: 'retirada', rotulo: 'Retirada do Veículo', cor: 'bg-violet-600', borda: 'border-violet-600', campo: 'data_retirada_veiculo', botao: 'Registrar Retirada', data: (o) => o.dataRetiradaVeiculo },
];

/** Colunas que o usuário pode ocultar (OS e Ações ficam sempre visíveis). */
const COLUNAS = [
  { id: 'veiculo', rotulo: 'Veículo' },
  { id: 'placa', rotulo: 'Placa' },
  { id: 'cliente', rotulo: 'Cliente' },
  { id: 'descricao', rotulo: 'Descrição do Serviço' },
  { id: 'valor', rotulo: 'Valor (R$)' },
  { id: 'entrada', rotulo: 'Entrada' },
  { id: 'status', rotulo: 'Status' },
] as const;
type ColunaId = (typeof COLUNAS)[number]['id'];
const CHAVE_COLUNAS_OCULTAS = 'erp.ordens.colunasOcultas';

const paraOpcao =(c: Carro): OpcaoCombobox => {
  const dono = c.clienteNome ?? '—';
  return {
    id: c.id,
    rotulo: `${maskPlaca(c.placa)} - ${c.marca} ${c.modelo} (${dono})`,
    busca: `${c.placa} ${c.marca} ${c.modelo} ${dono}`,
    principal: maskPlaca(c.placa),
    secundario: `${c.marca} ${c.modelo}`,
    terciario: `(${dono})`,
    mono: true,
  };
};

@Component({
  selector: 'app-ordens',
  standalone: true,
  host: { class: 'flex flex-col gap-5' },
  imports: [FormsModule, Icone, ModalDialog, ConfirmDeleteModal, StatusBadge, Combobox, Paginacao],
  templateUrl: './ordens.html',
  styleUrl: './ordens.css',
})
export class Ordens implements OnInit {
  private readonly ordemService = inject(OrdemService);
  private readonly carroService = inject(CarroService);
  private readonly toast = inject(ToastService);

  protected readonly STATUS = STATUS_ORDEM;
  protected readonly Etapa = EtapaOrdem;
  protected readonly etapas = [
    EtapaOrdem.Rascunho,
    EtapaOrdem.Inicio,
    EtapaOrdem.EmAndamento,
    EtapaOrdem.Finalizada,
    EtapaOrdem.Cancelada,
  ];
  protected readonly hoje = hojeIso();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // ----- colunas visíveis (preferência guardada no navegador)
  protected readonly colunas = COLUNAS;
  protected readonly menuColunasAberto = signal(false);
  protected readonly colunasOcultas = signal<ReadonlySet<ColunaId>>(this.lerColunasOcultas());

  protected visivel(id: ColunaId): boolean {
    return !this.colunasOcultas().has(id);
  }

  protected alternarColuna(id: ColunaId): void {
    const ocultas = new Set(this.colunasOcultas());
    if (!ocultas.delete(id)) ocultas.add(id);
    this.colunasOcultas.set(ocultas);
    try {
      localStorage.setItem(CHAVE_COLUNAS_OCULTAS, JSON.stringify([...ocultas]));
    } catch {
      /* armazenamento indisponível: a preferência vale só nesta sessão. */
    }
  }

  private lerColunasOcultas(): ReadonlySet<ColunaId> {
    try {
      const salvo: unknown = JSON.parse(localStorage.getItem(CHAVE_COLUNAS_OCULTAS) ?? '[]');
      const validos: string[] = COLUNAS.map((c) => c.id);
      return new Set(
        (Array.isArray(salvo) ? salvo : []).filter((id): id is ColunaId => validos.includes(id)),
      );
    } catch {
      return new Set();
    }
  }

  @HostListener('document:click', ['$event'])
  protected aoClicarFora(ev: Event): void {
    const area = this.host.nativeElement.querySelector('#colunas-area');
    if (this.menuColunasAberto() && !area?.contains(ev.target as Node)) this.menuColunasAberto.set(false);
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected aoEsc(ev: Event): void {
    if (!this.menuColunasAberto()) return;
    ev.preventDefault();
    this.menuColunasAberto.set(false);
  }

  protected readonly modo = signal<Modo>(null);
  /** OS em edição, detalhes ou exclusão. */
  protected readonly alvo = signal<Ordem | null>(null);

  // ----- helpers de apresentação
  protected veiculo(o: Ordem): string {
    return o.marca ? `${o.marca} ${o.modelo}` : '—';
  }
  protected placa(o: Ordem): string {
    return o.placa ? maskPlaca(o.placa) : '—';
  }
  protected cliente(o: Ordem): string {
    return o.clienteNome ?? '—';
  }
  protected numero(id: number): string {
    return '#' + String(id).padStart(5, '0');
  }
  protected readonly moeda = moeda;
  protected readonly data = dataBr;

  // ----- listagem paginada no servidor, busca (debounce) e abas
  protected readonly busca = signal('');
  protected readonly buscaDigitada = signal('');
  protected readonly aba = signal<Aba>('todas');
  private timerBusca?: ReturnType<typeof setTimeout>;

  protected readonly abas: { id: Aba; rotulo: string; fundo: string; texto: string }[] = [
    { id: 'todas', rotulo: 'Todas', fundo: 'bg-slate-200', texto: 'text-slate-700' },
    { id: 'abertas', rotulo: 'Abertas', fundo: 'bg-amber-100', texto: 'text-amber-800' },
    { id: 'finalizadas', rotulo: 'Finalizadas', fundo: 'bg-emerald-100', texto: 'text-emerald-800' },
    { id: 'canceladas', rotulo: 'Canceladas', fundo: 'bg-rose-100', texto: 'text-rose-800' },
  ];

  protected readonly lista = new ListaPaginada<Ordem>((pagina) =>
    this.ordemService.listar({
      etapas: ETAPAS_DA_ABA[this.aba()],
      busca: this.busca(),
      page: pagina,
      pageSize: TAMANHO_PAGINA,
    }),
  );

  /** Total de OS de cada aba para a busca atual. */
  protected readonly contagens = signal<Record<Aba, number>>({
    todas: 0,
    abertas: 0,
    finalizadas: 0,
    canceladas: 0,
  });

  ngOnInit(): void {
    this.recarregarTudo();
  }

  private recarregarTudo(): void {
    this.lista.carregar();
    this.carregarContagens();
  }

  private carregarContagens(): void {
    const chaves = this.abas.map((a) => a.id);
    forkJoin(
      chaves.map((id) =>
        this.ordemService.listar({ etapas: ETAPAS_DA_ABA[id], busca: this.busca(), pageSize: 1 }),
      ),
    ).subscribe({
      next: (respostas) =>
        this.contagens.set(
          Object.fromEntries(chaves.map((id, i) => [id, respostas[i].total])) as Record<Aba, number>,
        ),
      error: () => undefined, // as contagens são só informativas; a lista já mostra o erro.
    });
  }

  protected contar(aba: Aba): number {
    return this.contagens()[aba];
  }

  protected selecionarAba(aba: Aba): void {
    this.aba.set(aba);
    this.lista.recarregar();
  }

  protected aoDigitarBusca(valor: string): void {
    this.buscaDigitada.set(valor);
    clearTimeout(this.timerBusca);
    this.timerBusca = setTimeout(() => {
      this.busca.set(valor.trim());
      this.lista.recarregar();
      this.carregarContagens();
    }, 300);
  }

  protected limparFiltros(): void {
    clearTimeout(this.timerBusca);
    this.buscaDigitada.set('');
    this.busca.set('');
    this.aba.set('todas');
    this.lista.recarregar();
    this.carregarContagens();
  }

  // ----- formulário (nova / editar)
  protected readonly form = signal<FormOrdem>({ carroId: null, descricao: '', valor: '', data: this.hoje });
  protected readonly tocado = signal(false);
  protected readonly salvando = signal(false);
  /** Mensagem devolvida pela API ao salvar. */
  protected readonly erroApi = signal('');

  /** Opções do combobox de veículo, alimentadas por busca no servidor. */
  protected readonly opcoesVeiculos = signal<OpcaoCombobox[]>([]);
  private timerVeiculos?: ReturnType<typeof setTimeout>;

  protected abrirNova(): void {
    this.form.set({ carroId: null, descricao: '', valor: '', data: this.hoje });
    this.opcoesVeiculos.set([]);
    this.alvo.set(null);
    this.abrirForm('nova');
  }

  protected abrirEditar(o: Ordem): void {
    this.form.set({
      carroId: o.carroId,
      descricao: o.descricaoOrdem,
      valor: numero2(o.valorServico),
      data: o.dataEntradaCarro,
    });
    // O veículo atual precisa estar nas opções mesmo fora do primeiro resultado da busca.
    this.opcoesVeiculos.set([
      {
        id: o.carroId,
        rotulo: `${this.placa(o)} - ${this.veiculo(o)} (${this.cliente(o)})`,
        busca: `${o.placa} ${this.veiculo(o)} ${this.cliente(o)}`,
        principal: this.placa(o),
        secundario: this.veiculo(o),
        terciario: `(${this.cliente(o)})`,
        mono: true,
      },
    ]);
    this.alvo.set(o);
    this.abrirForm('editar');
  }

  private abrirForm(modo: 'nova' | 'editar'): void {
    this.tocado.set(false);
    this.erroApi.set('');
    this.modo.set(modo);
    this.carregarVeiculos('');
  }

  protected fechar(): void {
    clearTimeout(this.timerVeiculos);
    this.modo.set(null);
    this.salvando.set(false);
    this.salvandoStatus.set(false);
  }

  protected buscarVeiculos(texto: string): void {
    clearTimeout(this.timerVeiculos);
    this.timerVeiculos = setTimeout(() => this.carregarVeiculos(texto), 300);
  }

  private carregarVeiculos(texto: string): void {
    this.carroService.listar({ busca: texto.trim(), pageSize: 20 }).subscribe({
      next: (r) => {
        const encontrados = r.items.map(paraOpcao);
        const escolhido = this.opcoesVeiculos().find((o) => o.id === this.form().carroId);
        this.opcoesVeiculos.set(
          escolhido && !encontrados.some((o) => o.id === escolhido.id)
            ? [escolhido, ...encontrados]
            : encontrados,
        );
      },
      error: () => this.erroApi.set('Não foi possível carregar os veículos.'),
    });
  }

  protected aoDigitar(campo: 'descricao' | 'valor' | 'data', valor: string): void {
    const v = campo === 'valor' ? maskMoeda(valor) : valor;
    this.form.update((f) => ({ ...f, [campo]: v }));
  }

  protected escolherVeiculo(id: number | null): void {
    this.form.update((f) => ({ ...f, carroId: id }));
  }

  protected readonly erros = computed<Record<CampoForm, string>>(() => {
    const f = this.form();
    return {
      carroId: f.carroId ? '' : 'Selecione o veículo.',
      descricao: f.descricao.trim() ? '' : 'Descreva o defeito e o serviço.',
      valor: lerMoeda(f.valor) > 0 ? '' : 'Informe o valor.',
      data: f.data ? '' : 'Informe a data.',
    };
  });

  protected erro(campo: CampoForm): string {
    return this.tocado() ? this.erros()[campo] : '';
  }

  protected salvar(): void {
    this.tocado.set(true);
    const e = this.erros();
    if (e.carroId || e.descricao || e.valor || e.data || this.salvando()) return;

    const f = this.form();
    const dados = {
      carroId: f.carroId!,
      descricaoOrdem: f.descricao.trim(),
      valorServico: lerMoeda(f.valor),
      dataEntradaCarro: f.data,
    };
    const editando = this.modo() === 'editar';
    const chamada = editando
      ? this.ordemService.editar(this.alvo()!.id, dados)
      : this.ordemService.criar(dados);

    this.salvando.set(true);
    this.erroApi.set('');
    chamada.subscribe({
      next: (ordem) => {
        this.toast.mostrar(
          editando
            ? `OS ${this.numero(ordem.id)} atualizada.`
            : `OS ${this.numero(ordem.id)} aberta com sucesso.`,
        );
        this.fechar();
        if (editando) {
          this.recarregarTudo();
        } else {
          this.aba.set('todas');
          this.lista.recarregar();
          this.carregarContagens();
        }
      },
      error: (err) => {
        this.erroApi.set(mensagemErro(err, 'Não foi possível salvar a ordem de serviço.'));
        this.salvando.set(false);
      },
    });
  }

  // ----- detalhes / timeline / transição de etapa
  protected readonly statusSelecionado = signal<EtapaOrdem>(EtapaOrdem.Rascunho);
  protected readonly motivo = signal('');
  protected readonly valorReajustado = signal('');
  protected readonly statusTocado = signal(false);
  protected readonly salvandoStatus = signal(false);

  protected abrirDetalhes(o: Ordem): void {
    this.alvo.set(o);
    this.carregarDetalhes(o);
    this.modo.set('detalhes');
  }

  private carregarDetalhes(o: Ordem): void {
    this.statusSelecionado.set(o.etapa);
    this.motivo.set('');
    this.valorReajustado.set(numero2(o.valorServico));
    this.statusTocado.set(false);
  }

  /** Finalizada e Cancelada são etapas finais. */
  protected readonly travada = computed(() => (this.alvo()?.etapa ?? EtapaOrdem.Rascunho) >= EtapaOrdem.Finalizada);

  protected podeEscolher(etapa: EtapaOrdem): boolean {
    return !this.travada() && etapa >= (this.alvo()?.etapa ?? EtapaOrdem.Rascunho);
  }

  protected readonly erroMotivo = computed(() =>
    this.statusTocado() && this.statusSelecionado() === EtapaOrdem.Cancelada && !this.motivo().trim()
      ? 'Informe o motivo do cancelamento.'
      : '',
  );

  protected readonly ajudaStatus = computed(() => {
    if (this.travada()) return 'Etapa final: esta OS não pode mais mudar de etapa.';
    if (this.statusSelecionado() === EtapaOrdem.Finalizada)
      return 'Ao salvar, a data de fim do serviço será preenchida com hoje.';
    if (this.statusSelecionado() === EtapaOrdem.Cancelada) return 'Informe o motivo para cancelar a OS.';
    return 'A OS só avança para uma etapa posterior; as datas são preenchidas automaticamente.';
  });

  protected readonly passos = computed(() => {
    const o = this.alvo();
    if (!o) return [];
    return PASSOS.map((p, i) => {
      const feito = !!p.data(o);
      const anteriorFeito = i === 0 || !!PASSOS[i - 1].data(o);
      const podeAgir =
        !feito && anteriorFeito && !!p.botao && (p.chave === 'retirada' || !this.travada());
      const proximo = PASSOS[i + 1];
      return {
        ...p,
        feito,
        podeAgir,
        data: feito
          ? dataBr(p.data(o)!)
          : o.etapa === EtapaOrdem.Cancelada && p.chave !== 'retirada'
            ? 'Não realizado'
            : 'Pendente',
        linha: !proximo ? 'bg-transparent' : proximo.data(o) ? proximo.cor : 'bg-slate-200',
      };
    });
  });

  protected readonly tempoOficina = computed(() => {
    const o = this.alvo();
    if (!o) return '';
    if (!o.dataFimServico) return 'Entrada em ' + dataBr(o.dataEntradaCarro);
    const dias = Math.round(
      (new Date(o.dataFimServico).getTime() - new Date(o.dataEntradaCarro).getTime()) / 86400000,
    );
    return `Tempo de oficina: ${dias} dia(s)`;
  });

  protected registrarPasso(chave: PassoChave, rotulo: string): void {
    const o = this.alvo()!;
    const dados =
      chave === 'inicio'
        ? { etapa: EtapaOrdem.EmAndamento }
        : chave === 'fim'
          ? { etapa: EtapaOrdem.Finalizada }
          : { etapa: o.etapa, dataRetiradaVeiculo: this.hoje };

    this.aplicar(this.ordemService.atualizarEtapa(o.id, dados), `${rotulo} registrada.`);
  }

  protected escolherStatus(etapa: EtapaOrdem): void {
    if (!this.podeEscolher(etapa)) return;
    this.statusSelecionado.set(etapa);
    this.statusTocado.set(false);
  }

  protected salvarStatus(): void {
    const o = this.alvo()!;
    if (this.travada() || this.salvandoStatus()) return;

    const nova = this.statusSelecionado();
    if (nova === EtapaOrdem.Cancelada && !this.motivo().trim()) {
      this.statusTocado.set(true);
      return;
    }

    const valor = lerMoeda(this.valorReajustado());
    const reajusta = valor > 0 && valor !== o.valorServico;
    const mudaEtapa = nova !== o.etapa;
    if (!reajusta && !mudaEtapa) {
      this.toast.mostrar('Nenhuma alteração para salvar.');
      return;
    }

    // Reajuste de valor (PUT) antes da mudança de etapa (PATCH), que trava a OS ao finalizar.
    const reajuste$: Observable<Ordem> = reajusta
      ? this.ordemService.editar(o.id, {
          carroId: o.carroId,
          descricaoOrdem: o.descricaoOrdem,
          valorServico: valor,
          dataEntradaCarro: o.dataEntradaCarro,
        })
      : of(o);
    const chamada = reajuste$.pipe(
      switchMap((atual) =>
        mudaEtapa
          ? this.ordemService.atualizarEtapa(o.id, {
              etapa: nova,
              observacao: nova === EtapaOrdem.Cancelada ? this.motivo().trim() : undefined,
            })
          : of(atual),
      ),
    );
    this.aplicar(chamada, `OS ${this.numero(o.id)} salva.`);
  }

  /** Executa a mudança, atualiza o modal de detalhes com a resposta e recarrega a lista. */
  private aplicar(chamada: Observable<Ordem>, sucesso: string): void {
    this.salvandoStatus.set(true);
    chamada.subscribe({
      next: (ordem) => {
        this.alvo.set(ordem);
        this.carregarDetalhes(ordem);
        this.salvandoStatus.set(false);
        this.toast.mostrar(sucesso);
        this.recarregarTudo();
      },
      error: (err) => {
        this.toast.mostrar(mensagemErro(err, 'Não foi possível atualizar a OS.'));
        this.salvandoStatus.set(false);
      },
    });
  }

  protected aoDigitarReajuste(valor: string): void {
    this.valorReajustado.set(maskMoeda(valor));
  }

  // ----- exclusão
  protected abrirExcluir(o: Ordem): void {
    this.alvo.set(o);
    this.modo.set('excluir');
  }

  protected excluir(): void {
    const o = this.alvo()!;
    this.ordemService.excluir(o.id).subscribe({
      next: () => {
        this.toast.mostrar(`OS ${this.numero(o.id)} excluída.`);
        this.modo.set(null);
        this.recarregarTudo();
      },
      error: (err) => {
        this.toast.mostrar(mensagemErro(err, 'Não foi possível excluir a OS.'));
        this.modo.set(null);
      },
    });
  }
}
