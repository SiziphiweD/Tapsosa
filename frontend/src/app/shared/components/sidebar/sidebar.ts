import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, Event } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private router = inject(Router);
  private auth = inject(AuthService);

  role: 'member' | 'supplier' | 'admin' | null = null;
  user: User | null = null;
  year = new Date().getFullYear();

  constructor() {
    this.setRole(this.router.url);
    
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        this.setRole(e.urlAfterRedirects);
      }
    });
    
    this.auth.currentUser$.subscribe((u: User | null) => {
      this.user = u;
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
    // Different icons for each role
    if (this.role === 'admin') return 'bi-shield-lock';
    if (this.role === 'supplier') return 'bi-briefcase-fill';
    if (this.role === 'member') return 'bi-building';
    return 'bi-shield';
  }

  isMemberBidsActive() {
    const url = this.router.url;
    return url.startsWith('/member/requests') && !url.startsWith('/member/requests/new');
  }

  signOut() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}