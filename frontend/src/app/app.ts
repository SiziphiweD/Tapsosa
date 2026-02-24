import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private router = inject(Router);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        document.body.classList.add('route-loading');
      }
      if (event instanceof NavigationEnd) {
        document.body.classList.remove('route-loading');
        const publicAndAuthRoutes = [
          '/how-it-works',
          '/pricing',
          '/about',
          '/faqs',
          '/contact',
          '/forgot-password',
          '/register-member',
          '/register-supplier',
          '/reset-password',
          '/sign-in',
        ];

        if (publicAndAuthRoutes.some(route => event.urlAfterRedirects.includes(route))) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
        setTimeout(() => {
          this.cleanupOverlays();
        }, 0);
      }
      if (event instanceof NavigationError) {
        document.body.classList.remove('route-loading');
        this.cleanupOverlays();
      }
    });
    window.addEventListener('error', () => {
      this.cleanupOverlays();
    });
    window.addEventListener('unhandledrejection', () => {
      this.cleanupOverlays();
    });
  }

  private cleanupOverlays() {
    const selectors = [
      '.modal-backdrop',
      '.cdk-overlay-backdrop',
      '.cdk-overlay-container',
      '.mat-drawer-backdrop',
      '.loading-overlay',
      '[class*="overlay"]',
      '[class*="backdrop"]',
      '[data-backdrop]'
    ];
    selectors.forEach((s) => {
      document.querySelectorAll(s).forEach((el) => {
        const e = el as HTMLElement;
        if (e && e.parentElement) {
          e.parentElement.removeChild(e);
        }
      });
    });
    document.body.classList.remove('modal-open', 'cdk-global-scrollblock');
    document.body.style.overflow = 'auto';
    document.body.style.pointerEvents = 'auto';
  }
}
