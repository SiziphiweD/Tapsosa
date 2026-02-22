import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-sign-in-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-in-page.html',

})
export class SignInPage {
  private auth = inject(AuthService);
  private router = inject(Router);


  email = '';
  password = '';
  error = '';
  loading = false;
  passwordFieldType: string = 'password';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

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
