import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
}

export interface AuthResponse {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}

const CHAVE_TOKEN = 'erp.token';
const CHAVE_USUARIO = 'erp.usuario';
const CHAVE_EXPIRA_EM = 'erp.expiraEm';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _usuario = signal<Usuario | null>(this.lerUsuarioDaSessao());

  readonly usuario = this._usuario.asReadonly();
  readonly logado = computed(() => this._usuario() !== null);

  login(login: string, senha: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { login, senha })
      .pipe(tap((resposta) => this.salvarSessao(resposta)));
  }

  register(nome: string, login: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/register`, { nome, login, senha });
  }

  /** Há token na sessão e ele ainda não expirou. */
  temSessaoValida(): boolean {
    const token = this.token();
    if (!token) return false;

    const expiraEm = this.ler(CHAVE_EXPIRA_EM);
    return !expiraEm || new Date(expiraEm).getTime() > Date.now();
  }

  token(): string | null {
    return this.ler(CHAVE_TOKEN);
  }

  /**
   * Sincroniza o estado em memória com o sessionStorage e confirma o token na API.
   * Chamado pelo header sempre que ele é carregado (F5, rota digitada na URL, etc.).
   */
  restaurarSessao(): void {
    if (!this.temSessaoValida()) {
      this.limparSessao();
      return;
    }

    this._usuario.set(this.lerUsuarioDaSessao());

    // Um 401 aqui é tratado pelo interceptor (limpa a sessão e volta ao login).
    this.http.get<Usuario>(`${this.apiUrl}/me`).subscribe({
      next: (usuario) => {
        this._usuario.set(usuario);
        this.gravar(CHAVE_USUARIO, JSON.stringify(usuario));
      },
      error: () => {},
    });
  }

  logout(): void {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  limparSessao(): void {
    this._usuario.set(null);
    this.remover(CHAVE_TOKEN);
    this.remover(CHAVE_USUARIO);
    this.remover(CHAVE_EXPIRA_EM);
  }

  private salvarSessao(resposta: AuthResponse): void {
    this.gravar(CHAVE_TOKEN, resposta.token);
    this.gravar(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
    this.gravar(CHAVE_EXPIRA_EM, resposta.expiraEm);
    this._usuario.set(resposta.usuario);
  }

  private lerUsuarioDaSessao(): Usuario | null {
    const bruto = this.ler(CHAVE_USUARIO);
    if (!bruto) return null;
    try {
      return JSON.parse(bruto) as Usuario;
    } catch {
      return null;
    }
  }

  private ler(chave: string): string | null {
    try {
      return sessionStorage.getItem(chave);
    } catch {
      return null;
    }
  }

  private gravar(chave: string, valor: string): void {
    try {
      sessionStorage.setItem(chave, valor);
    } catch {
      // storage indisponível: a sessão vale só em memória.
    }
  }

  private remover(chave: string): void {
    try {
      sessionStorage.removeItem(chave);
    } catch {
      // ignora
    }
  }
}
