import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-register-member-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-member-page.html',

})
export class RegisterMemberPage {
  private auth = inject(AuthService);
  private router = inject(Router);


  organization = '';
  email = '';
  password = '';
  confirmPassword = '';
  registrationNumber = '';
  contactPersonName = '';
  phoneNumber = '';
  industryType = '';
  physicalAddress = '';
  loading = false;
  error = '';
  passwordFieldType: string = 'password';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  async register() {
    this.error = '';
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    try {
      await this.auth.registerMember(this.organization, this.email, this.password);
      this.router.navigateByUrl('/member/upload-documents');
    } catch (e: any) {
      this.error = e?.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
