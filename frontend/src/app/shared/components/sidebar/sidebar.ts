import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
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
        this.role = u.role;
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
