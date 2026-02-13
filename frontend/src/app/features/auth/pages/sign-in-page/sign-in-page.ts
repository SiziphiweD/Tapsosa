import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-sign-in-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.css',
})
export class SignInPage {

  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async signIn() {
    this.error = '';
    this.loading = true;
    try {
      const user = await this.auth.signIn(this.email, this.password);
      if (user.role === 'member') {
        this.router.navigateByUrl('/member/dashboard');
      } else if (user.role === 'supplier') {
        this.router.navigateByUrl('/supplier/dashboard');
      } else {
        this.router.navigateByUrl('/admin/dashboard');
      }
    } catch (e: any) {
      this.error = e?.message || 'Sign in failed';
    } finally {
      this.loading = false;
    }
  }
}
