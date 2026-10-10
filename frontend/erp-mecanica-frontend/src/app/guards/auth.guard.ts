import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protege rotas privadas: sem sessão válida redireciona para o login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.temSessaoValida()) {
    return true;
  }

  auth.limparSessao();
  return router.createUrlTree(['/login']);
};

/** Telas públicas (login/cadastro): quem já está logado vai para o dashboard. */
export const publicoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.temSessaoValida() ? router.createUrlTree(['/dashboard']) : true;
};
