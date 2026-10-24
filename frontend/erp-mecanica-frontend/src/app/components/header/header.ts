import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Icone } from '../icone';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icone],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  protected readonly auth = inject(AuthService);

  protected readonly links = [
    { rota: '/dashboard', texto: 'Dashboard' },
    { rota: '/clientes', texto: 'Clientes' },
    { rota: '/carros', texto: 'Veículos' },
    { rota: '/ordens', texto: 'Ordens de Serviço' },
  ];

  ngOnInit(): void {
    // Sincroniza a sessão do navegador toda vez que o header é carregado.
    this.auth.restaurarSessao();
  }

  protected iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  protected sair(): void {
    this.auth.logout();
  }
}
