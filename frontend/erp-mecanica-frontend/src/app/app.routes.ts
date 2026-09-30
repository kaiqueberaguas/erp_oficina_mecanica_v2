import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Clientes } from './pages/clientes/clientes';
import { Carros } from './pages/carros/carros';
import { Ordens } from './pages/ordens/ordens';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'clientes',
    component: Clientes,
  },
  {
    path: 'carros',
    component: Carros,
  },
  {
    path: 'ordens',
    component: Ordens,
  },
];