import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-register-member-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-member-page.html',

})
export class RegisterMemberPage {

  organization = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  passwordFieldType: string = 'password';

  constructor(private auth: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  async register() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.registerMember(this.organization, this.email, this.password);
      this.router.navigateByUrl('/auth/sign-in');
    } catch (e: any) {
      this.error = e?.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
