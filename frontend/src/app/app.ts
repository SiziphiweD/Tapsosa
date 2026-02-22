import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
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
      }
    });
  }
}
