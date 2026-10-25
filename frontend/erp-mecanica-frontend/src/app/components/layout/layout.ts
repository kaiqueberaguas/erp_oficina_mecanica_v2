import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Toast } from '../toast/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, RouterOutlet, Toast],
  template: `
    <a
      href="#conteudo"
      class="sr-only-focusable z-40 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
      >Pular para o conteúdo</a
    >
    <app-header />
    <main
      id="conteudo"
      tabindex="-1"
      class="mx-auto flex max-w-[1320px] flex-col gap-5 px-7 pt-8 pb-14"
    >
      <router-outlet />
    </main>
    <footer class="px-7 pb-8 text-center text-xs text-slate-600">
      ERP Oficina Mecânica · Projeto Integrador
    </footer>
    <app-toast />
  `,
})
export class Layout {}
