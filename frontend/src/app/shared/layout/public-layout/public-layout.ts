import { Component } from '@angular/core';
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
  showNavbar = true;

  constructor(private router: Router) {
    this.showNavbar = true;
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.showNavbar = true;
      }
    });
  }
}
