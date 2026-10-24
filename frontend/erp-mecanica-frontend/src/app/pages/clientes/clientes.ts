import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmDeleteModal } from '../../components/confirm-delete-modal/confirm-delete-modal';
import { Icone } from '../../components/icone';
import { ModalDialog } from '../../components/modal-dialog/modal-dialog';
import { Paginacao } from '../../components/paginacao/paginacao';
import { ToastService } from '../../components/toast/toast';
import { Cliente } from '../../models/cliente';
import { ClienteService } from '../../services/cliente.service';
import { mensagemErro } from '../../utils/erro-api';
import { cpfValido, digitos, ehEmail, maskContato, maskCpf } from '../../utils/formatacao';
import { ListaPaginada, TAMANHO_PAGINA } from '../../utils/lista-paginada';

type CampoForm = 'nome' | 'cpf' | 'contato';

const FORM_VAZIO = { nome: '', cpf: '', contato: '' };

@Component({
  selector: 'app-clientes',
  standalone: true,
  host: { class: 'flex flex-col gap-5' },
  imports: [FormsModule, RouterLink, Icone, ModalDialog, ConfirmDeleteModal, Paginacao],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly toast = inject(ToastService);

  // ----- listagem paginada no servidor
  /** Texto efetivamente aplicado à busca (após o debounce de 300ms). */
  protected readonly busca = signal('');
  /** Texto exibido no campo, antes do debounce. */
  protected readonly buscaDigitada = signal('');
  private timerBusca?: ReturnType<typeof setTimeout>;

  protected readonly lista = new ListaPaginada<Cliente>((pagina) =>
    this.clienteService.listar({ busca: this.busca(), page: pagina, pageSize: TAMANHO_PAGINA }),
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

  protected readonly maskCpf = maskCpf;

  protected rotuloVeiculos(c: Cliente): string {
    const n = c.totalCarros;
    return n === 0 ? 'Nenhum' : n === 1 ? '1 veículo' : `${n} veículos`;
  }

  protected idFormatado(id: number): string {
    return String(id).padStart(3, '0');
  }

  // ----- formulário (novo / editar)
  protected readonly mostrarModalForm = signal(false);
  protected readonly editando = signal(false);
  protected readonly form = signal({ ...FORM_VAZIO });
  protected readonly tocado = signal(false);
  protected readonly salvando = signal(false);
  /** Mensagem devolvida pela API (ex.: CPF já cadastrado). */
  protected readonly erroApi = signal('');
  private idEmEdicao = 0;

  protected novoCliente(): void {
    this.editando.set(false);
    this.idEmEdicao = 0;
    this.form.set({ ...FORM_VAZIO });
    this.abrirForm();
  }

  protected editarCliente(cliente: Cliente): void {
    this.editando.set(true);
    this.idEmEdicao = cliente.id;
    this.form.set({ nome: cliente.nome, cpf: maskCpf(cliente.cpf), contato: cliente.contato });
    this.abrirForm();
  }

  private abrirForm(): void {
    this.tocado.set(false);
    this.erroApi.set('');
    this.mostrarModalForm.set(true);
  }

  protected fecharForm(): void {
    this.mostrarModalForm.set(false);
    this.salvando.set(false);
  }

  protected aoDigitar(campo: CampoForm, valor: string): void {
    const v = campo === 'cpf' ? maskCpf(valor) : campo === 'contato' ? maskContato(valor) : valor;
    this.form.update((f) => ({ ...f, [campo]: v }));
  }

  protected readonly erros = computed<Record<CampoForm, string>>(() => {
    const f = this.form();
    const e: Record<CampoForm, string> = { nome: '', cpf: '', contato: '' };
    if (!f.nome.trim()) e.nome = 'Informe o nome do cliente.';
    if (!f.cpf) e.cpf = 'Informe o CPF.';
    else if (!cpfValido(f.cpf)) e.cpf = 'CPF inválido.';
    if (!f.contato.trim()) e.contato = 'Informe um telefone ou e-mail.';
    else if (ehEmail(f.contato) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.contato))
      e.contato = 'E-mail inválido.';
    else if (!ehEmail(f.contato) && digitos(f.contato).length < 10)
      e.contato = 'Telefone incompleto.';
    return e;
  });

  protected erro(campo: CampoForm): string {
    return this.tocado() ? this.erros()[campo] : '';
  }

  protected salvarCliente(): void {
    this.tocado.set(true);
    const e = this.erros();
    if (e.nome || e.cpf || e.contato || this.salvando()) return;

    const f = this.form();
    const dados = { nome: f.nome.trim(), cpf: f.cpf, contato: f.contato };
    const editando = this.editando();
    const chamada = editando
      ? this.clienteService.editar(this.idEmEdicao, dados)
      : this.clienteService.criar(dados);

    this.salvando.set(true);
    this.erroApi.set('');
    chamada.subscribe({
      next: () => {
        this.toast.mostrar(
          editando ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.',
        );
        this.fecharForm();
        this.lista.carregar();
      },
      error: (err) => {
        this.erroApi.set(mensagemErro(err, 'Não foi possível salvar o cliente.'));
        this.salvando.set(false);
      },
    });
  }

  // ----- exclusão
  protected readonly clienteSelecionado = signal<Cliente | null>(null);

  protected abrirModalExclusao(cliente: Cliente): void {
    this.clienteSelecionado.set(cliente);
  }

  protected cancelarExclusao(): void {
    this.clienteSelecionado.set(null);
  }

  protected excluirCliente(): void {
    const cliente = this.clienteSelecionado();
    if (!cliente) return;

    // Os veículos e as OS do cliente são removidos em cascata pelo banco.
    this.clienteService.excluir(cliente.id).subscribe({
      next: () => {
        this.toast.mostrar('Cliente excluído.');
        this.cancelarExclusao();
        this.lista.carregar();
      },
      error: (err) => {
        this.toast.mostrar(mensagemErro(err, 'Não foi possível excluir o cliente.'));
        this.cancelarExclusao();
      },
    });
  }
}
