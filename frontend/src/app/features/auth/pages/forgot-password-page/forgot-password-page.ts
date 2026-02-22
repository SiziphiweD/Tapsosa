import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password-page.html',

})
export class ForgotPasswordPage {
  email = '';
  sent = false;
  loading = false;
  error: string | null = null;

  requestReset() {
    this.sent = true;
  }
}
