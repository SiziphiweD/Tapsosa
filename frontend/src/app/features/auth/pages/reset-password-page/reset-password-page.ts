import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password-page.html',

})
export class ResetPasswordPage {
  password = '';
  confirm = '';
  done = false;
  loading = false;
  error: string | null = null;
  passwordFieldType: 'password' | 'text' = 'password';
  confirmFieldType: 'password' | 'text' = 'password';

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  toggleConfirmVisibility() {
    this.confirmFieldType = this.confirmFieldType === 'password' ? 'text' : 'password';
  }

  reset() {
    if (this.password && this.password === this.confirm) {
      this.done = true;
    }
  }
}
