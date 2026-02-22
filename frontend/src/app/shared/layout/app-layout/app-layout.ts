import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';

import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-app-layout',
  imports: [Navbar, Sidebar, RouterOutlet],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {
  role: 'member' | 'supplier' | 'admin' | null = null;
  user: User | null = null;

  constructor(private router: Router, private auth: AuthService) {
    this.setRole(router.url);
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.setRole(e.urlAfterRedirects);
      }
    });
    auth.currentUser$.subscribe((u) => {
      this.user = u;
      if (u?.role) {
        this.role =
          u.role === 'member'
            ? 'member'
            : u.role === 'supplier'
            ? 'supplier'
            : u.role === 'admin'
            ? 'admin'
            : null;
      }
    });
  }

  private setRole(url: string) {
    if (url.startsWith('/member')) {
      this.role = 'member';
    } else if (url.startsWith('/supplier')) {
      this.role = 'supplier';
    } else if (url.startsWith('/admin')) {
      this.role = 'admin';
    } else {
      this.role = null;
    }
  }
}
