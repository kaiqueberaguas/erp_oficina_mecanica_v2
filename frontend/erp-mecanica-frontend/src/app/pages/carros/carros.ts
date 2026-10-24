import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Combobox, OpcaoCombobox } from '../../components/combobox/combobox';
import { ConfirmDeleteModal } from '../../components/confirm-delete-modal/confirm-delete-modal';
import { Icone } from '../../components/icone';
import { ModalDialog } from '../../components/modal-dialog/modal-dialog';
import { Paginacao } from '../../components/paginacao/paginacao';
import { ToastService } from '../../components/toast/toast';
import { Carro } from '../../models/carro';
import { Cliente } from '../../models/cliente';
import { CarroService } from '../../services/carro.service';
import { ClienteService } from '../../services/cliente.service';
import { mensagemErro } from '../../utils/erro-api';
import { maskCpf, maskPlaca, placaValida } from '../../utils/formatacao';
import { ListaPaginada, TAMANHO_PAGINA } from '../../utils/lista-paginada';

type CampoForm = 'clienteId' | 'marca' | 'modelo' | 'placa';

interface FormCarro {
  clienteId: number | null;
  marca: string;
  modelo: string;
  placa: string;
}

const FORM_VAZIO: FormCarro = { clienteId: null, marca: '', modelo: '', placa: '' };

const paraOpcao = (c: Cliente): OpcaoCombobox => ({
  id: c.id,
  rotulo: c.nome,
  busca: `${c.nome} ${maskCpf(c.cpf)}`,
  principal: c.nome,
  terciario: maskCpf(c.cpf),
});

@Component({
  selector: 'app-carros',
  standalone: true,
  host: { class: 'flex flex-col gap-5' },
  imports: [FormsModule, RouterLink, Icone, ModalDialog, ConfirmDeleteModal, Combobox, Paginacao],
  templateUrl: './carros.html',
  styleUrl: './carros.css',
})
export class Carros implements OnInit {
  private readonly carroService = inject(CarroService);
  private readonly clienteService = inject(ClienteService);
  private readonly toast = inject(ToastService);

  protected readonly marcas = ['Fiat', 'Volkswagen', 'Chevrolet', 'Ford', 'Toyota', 'Honda', 'Hyundai'];
  protected readonly maskPlaca = maskPlaca;

  // ----- listagem paginada no servidor
  protected readonly busca = signal('');
  protected readonly buscaDigitada = signal('');
  private timerBusca?: ReturnType<typeof setTimeout>;

  protected readonly lista = new ListaPaginada<Carro>((pagina) =>
    this.carroService.listar({ busca: this.busca(), page: pagina, pageSize: TAMANHO_PAGINA }),
  );

  ngOnInit(): void {
    this.lista.carregar(1);
  }

  protected aoDigitarBusca(valor: string): void {
    this.buscaDigitada.set(valor);
    clearTimeout(this.timerBusca);
    this.timerBusca = setTimeout(() => {
      this.busca.set(valor.trim());
      this.lista.recarregar();
    }, 300);
  }

  protected limparBusca(): void {
    clearTimeout(this.timerBusca);
    this.buscaDigitada.set('');
    this.busca.set('');
    this.lista.recarregar();
  }

  protected nomeDono(v: Carro): string {
    return v.clienteNome ?? '—';
  }

  protected idFormatado(id: number): string {
    return String(id).padStart(3, '0');
  }

  protected rotuloOs(v: Carro): string {
    const n = v.totalOrdens;
    return n === 0 ? 'Nenhuma OS' : n === 1 ? '1 OS' : `${n} OS`;
  }

  // ----- formulário (novo / editar)
  protected readonly mostrarModalForm = signal(false);
  protected readonly editando = signal(false);
  protected readonly form = signal<FormCarro>({ ...FORM_VAZIO });
  protected readonly tocado = signal(false);
  protected readonly salvando = signal(false);
  /** Mensagem devolvida pela API (ex.: placa já cadastrada). */
  protected readonly erroApi = signal('');
  private idEmEdicao = 0;

  /** Opções do combobox de proprietário, alimentadas por busca no servidor. */
  protected readonly opcoesClientes = signal<OpcaoCombobox[]>([]);
  private timerClientes?: ReturnType<typeof setTimeout>;

  protected novoCarro(): void {
    this.editando.set(false);
    this.idEmEdicao = 0;
    this.form.set({ ...FORM_VAZIO });
    this.opcoesClientes.set([]);
    this.abrirForm();
  }

  protected editarCarro(v: Carro): void {
    this.editando.set(true);
    this.idEmEdicao = v.id;
    this.form.set({
      clienteId: v.clienteId,
      marca: v.marca,
      modelo: v.modelo,
      placa: maskPlaca(v.placa),
    });
    // O proprietário atual precisa estar nas opções mesmo fora do primeiro resultado da busca.
    this.opcoesClientes.set([
      { id: v.clienteId, rotulo: this.nomeDono(v), busca: this.nomeDono(v), principal: this.nomeDono(v) },
    ]);
    this.abrirForm();
  }

  private abrirForm(): void {
    this.tocado.set(false);
    this.erroApi.set('');
    this.mostrarModalForm.set(true);
    this.carregarClientes('');
  }

  protected fecharForm(): void {
    clearTimeout(this.timerClientes);
    this.mostrarModalForm.set(false);
    this.salvando.set(false);
  }

  protected buscarClientes(texto: string): void {
    clearTimeout(this.timerClientes);
    this.timerClientes = setTimeout(() => this.carregarClientes(texto), 300);
  }

  private carregarClientes(texto: string): void {
    this.clienteService.listar({ busca: texto.trim(), pageSize: 20 }).subscribe({
      next: (r) => {
        const encontrados = r.items.map(paraOpcao);
        const escolhido = this.opcoesClientes().find((o) => o.id === this.form().clienteId);
        this.opcoesClientes.set(
          escolhido && !encontrados.some((o) => o.id === escolhido.id)
            ? [escolhido, ...encontrados]
            : encontrados,
        );
      },
      error: () => this.erroApi.set('Não foi possível carregar os clientes.'),
    });
  }

  protected aoDigitar(campo: 'marca' | 'modelo' | 'placa', valor: string): void {
    const v = campo === 'placa' ? maskPlaca(valor) : valor;
    this.form.update((f) => ({ ...f, [campo]: v }));
  }

  protected escolherCliente(id: number | null): void {
    this.form.update((f) => ({ ...f, clienteId: id }));
  }

  protected readonly erros = computed<Record<CampoForm, string>>(() => {
    const f = this.form();
    const e: Record<CampoForm, string> = { clienteId: '', marca: '', modelo: '', placa: '' };
    if (!f.clienteId) e.clienteId = 'Selecione o proprietário.';
    if (!f.marca.trim()) e.marca = 'Informe a marca.';
    if (!f.modelo.trim()) e.modelo = 'Informe o modelo.';
    if (!f.placa) e.placa = 'Informe a placa.';
    else if (!placaValida(f.placa)) e.placa = 'Placa inválida. Use AAA1A23 (Mercosul) ou AAA-1234.';
    return e;
  });

  protected erro(campo: CampoForm): string {
    return this.tocado() ? this.erros()[campo] : '';
  }

  protected salvarCarro(): void {
    this.tocado.set(true);
    const e = this.erros();
    if (e.clienteId || e.marca || e.modelo || e.placa || this.salvando()) return;

    const f = this.form();
    const dados = {
      clienteId: f.clienteId!,
      marca: f.marca.trim(),
      modelo: f.modelo.trim(),
      placa: f.placa,
    };
    const editando = this.editando();
    const chamada = editando
      ? this.carroService.editar(this.idEmEdicao, dados)
      : this.carroService.criar(dados);

    this.salvando.set(true);
    this.erroApi.set('');
    chamada.subscribe({
      next: () => {
        this.toast.mostrar(
          editando ? 'Veículo atualizado com sucesso.' : 'Veículo cadastrado com sucesso.',
        );
        this.fecharForm();
        this.lista.carregar();
      },
      error: (err) => {
        this.erroApi.set(mensagemErro(err, 'Não foi possível salvar o veículo.'));
        this.salvando.set(false);
      },
    });
  }

  // ----- exclusão
  protected readonly carroSelecionado = signal<Carro | null>(null);

  protected abrirModalExclusao(v: Carro): void {
    this.carroSelecionado.set(v);
  }

  protected cancelarExclusao(): void {
    this.carroSelecionado.set(null);
  }

  protected excluirCarro(): void {
    const v = this.carroSelecionado();
    if (!v) return;

    // As OS do veículo são removidas em cascata pelo banco.
    this.carroService.excluir(v.id).subscribe({
      next: () => {
        this.toast.mostrar('Veículo excluído.');
        this.cancelarExclusao();
        this.lista.carregar();
      },
      error: (err) => {
        this.toast.mostrar(mensagemErro(err, 'Não foi possível excluir o veículo.'));
        this.cancelarExclusao();
      },
    });
  }
}
