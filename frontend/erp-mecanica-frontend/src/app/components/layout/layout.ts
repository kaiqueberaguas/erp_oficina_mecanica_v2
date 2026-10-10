import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, RouterOutlet],
  template: `
    <app-header />
    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-outlet />
    </main>
  `,
})
export class Layout {}
