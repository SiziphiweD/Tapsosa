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
  year = new Date().getFullYear();

  constructor(private router: Router, private auth: AuthService) {
    this.setRole(router.url);
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.setRole(e.urlAfterRedirects);
      }
    });
    auth.currentUser$.subscribe((u) => {
      this.user = u;
      // Keep role derived from current route to ensure consistent theming
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

  roleIcon() {
    if (this.role === 'admin') return 'bi-shield-lock';
    if (this.role === 'supplier') return 'bi-briefcase';
    return 'bi-person-circle';
  }

  signOut() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
