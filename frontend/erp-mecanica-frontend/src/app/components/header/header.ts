import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  protected readonly auth = inject(AuthService);

  protected readonly links = [
    { rota: '/dashboard', texto: 'Dashboard' },
    { rota: '/clientes', texto: 'Clientes' },
    { rota: '/carros', texto: 'Carros' },
    { rota: '/ordens', texto: 'Ordens de Serviço' },
  ];

  ngOnInit(): void {
    // Sincroniza a sessão do navegador toda vez que o header é carregado.
    this.auth.restaurarSessao();
  }

  protected sair(): void {
    this.auth.logout();
  }
}
