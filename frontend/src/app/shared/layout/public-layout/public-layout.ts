import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-public-layout',
  imports: [Navbar, RouterOutlet, NgIf],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {
  private router = inject(Router);

  showNavbar = true;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const router = this.router;

    this.showNavbar = this.router.url === '/';
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.showNavbar = e.urlAfterRedirects === '/';
      }
    });
  }
}
