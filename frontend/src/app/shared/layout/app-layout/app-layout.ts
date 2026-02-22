import { Component, inject } from '@angular/core';
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
  private router = inject(Router);
  private auth = inject(AuthService);

  role: 'member' | 'supplier' | 'admin' | null = null;
  user: User | null = null;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const router = this.router;
    const auth = this.auth;

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

      if (u && u.role === 'member') {
        const status = (u.status || '').toLowerCase();
        if (status === 'rejected') {
          const url = this.router.url;
          if (!url.startsWith('/member/verification-pending')) {
            this.router.navigateByUrl('/member/verification-pending');
          }
        }
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
