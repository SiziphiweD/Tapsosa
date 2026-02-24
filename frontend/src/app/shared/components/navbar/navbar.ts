import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, Event } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { MockApiService, Activity } from '../../services/mock-api.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private auth = inject(AuthService);
  private api = inject(MockApiService);

  role: 'member' | 'supplier' | 'admin' | null = null;
  user: User | null = null;
  menuOpen = false;
  notificationsCount = 0;

  constructor() {
    this.setRole(this.router.url);
    
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        this.setRole(e.urlAfterRedirects);
        this.closeMenu(); // Close menu on navigation
      }
    });
    
    this.auth.currentUser$.subscribe((u: User | null) => {
      this.user = u;
    });
    
    this.api.listActivities().subscribe((acts: Activity[]) => {
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
    if (this.role === 'member') return 'bi-building';
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
    if (this.role === 'admin') return '/admin/profile';
    return '/';
  }

  settingsLink() {
    // Only used for admin now
    return '/admin/system';
  }

  helpLink() {
    // Only used for admin now
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