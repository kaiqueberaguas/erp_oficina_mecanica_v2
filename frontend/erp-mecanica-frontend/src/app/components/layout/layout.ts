import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Toast } from '../toast/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, RouterOutlet, Toast],
  template: `
    <app-header />
    <main class="mx-auto flex max-w-[1320px] flex-col gap-5 px-7 pt-8 pb-14">
      <router-outlet />
    </main>
    <app-toast />
  `,
})
export class Layout {}
