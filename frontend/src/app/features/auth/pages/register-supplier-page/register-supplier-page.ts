import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-register-supplier-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-supplier-page.html',

})
export class RegisterSupplierPage {

  company = '';
  email = '';
  category = 'Guarding Services';
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
      await this.auth.registerSupplier(this.company, this.email, this.password);
      this.router.navigateByUrl('/auth/sign-in');
    } catch (e: any) {
      this.error = e?.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
