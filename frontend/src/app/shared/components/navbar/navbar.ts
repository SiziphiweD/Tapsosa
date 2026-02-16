import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { MockApiService } from '../../services/mock-api.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  role: 'member' | 'supplier' | 'admin' | null = null;
  user: User | null = null;
  menuOpen = false;
  notificationsCount = 0;

  constructor(private router: Router, private auth: AuthService, private api: MockApiService) {
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
    this.api.listActivities().subscribe((acts) => {
      this.notificationsCount = Math.min(acts.length, 9);
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

  get roleLabel() {
    if (this.role === 'admin') return 'Admin';
    if (this.role === 'supplier') return 'Supplier';
    if (this.role === 'member') return 'Member';
    return '';
  }

  profileLink() {
    if (this.role === 'member') return '/member/settings/profile';
    if (this.role === 'supplier') return '/supplier/profile';
    if (this.role === 'admin') return '/admin/dashboard';
    return '/';
  }

  settingsLink() {
    if (this.role === 'member') return '/member/settings/security';
    if (this.role === 'supplier') return '/supplier/profile';
    if (this.role === 'admin') return '/admin/system';
    return '/';
  }

  helpLink() {
    return '/faqs';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  closeMenu() {
    this.menuOpen = false;
  }

  signOut() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
