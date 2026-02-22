import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements AfterViewInit {
  selectedRole: 'member' | 'supplier' = 'member';
  selectRole(role: 'member' | 'supplier') { this.selectedRole = role; }
  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  ngAfterViewInit(): void {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('style', 'opacity:1;transform:translateY(0)');
        }
      });
    }, observerOptions);
    document.querySelectorAll('.feature-card, .process-step').forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(30px)';
      (el as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(el);
    });
    document.addEventListener('mousemove', (e) => {
      const orbs = document.querySelectorAll('.orb');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        (orb as HTMLElement).style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    });
  }
}
