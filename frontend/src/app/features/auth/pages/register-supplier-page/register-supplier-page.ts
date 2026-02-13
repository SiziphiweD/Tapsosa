import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-register-supplier-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './register-supplier-page.html',
  styleUrl: './register-supplier-page.css',
})
export class RegisterSupplierPage {

  company = '';
  email = '';
  category = 'Guarding Services';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

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
