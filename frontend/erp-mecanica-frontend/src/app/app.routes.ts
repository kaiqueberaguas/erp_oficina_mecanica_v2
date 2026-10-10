import { Routes } from '@angular/router';

import { Layout } from './components/layout/layout';
import { authGuard, publicoGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { Dashboard } from './pages/dashboard/dashboard';
import { Clientes } from './pages/clientes/clientes';
import { Carros } from './pages/carros/carros';
import { Ordens } from './pages/ordens/ordens';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [publicoGuard],
  },
  {
    path: 'cadastro',
    component: Cadastro,
    canActivate: [publicoGuard],
  },
  {
    // Rotas privadas: o Layout carrega o header (que sincroniza a sessão) e o outlet.
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'clientes', component: Clientes },
      { path: 'carros', component: Carros },
      { path: 'ordens', component: Ordens },
    ],
  },
  { path: '**', redirectTo: '' },
];
