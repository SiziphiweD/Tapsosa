import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.css',
})
export class ResetPasswordPage {
  password = '';
  confirm = '';
  done = false;

  reset() {
    if (this.password && this.password === this.confirm) {
      this.done = true;
    }
  }
}
