import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-admin-profile-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile-page.html',
  styleUrl: './admin-profile-page.css',
})
export class AdminProfilePage {
  user: User | null = null;
  model = {
    name: '',
    email: '',
  };
  saved = false;

  constructor(private auth: AuthService) {
    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      if (u) {
        this.model = {
          name: u.name,
          email: u.email,
        };
      }
    });
  }

  get initial() {
    const base = this.user?.name || '';
    return base ? base.charAt(0).toUpperCase() : '';
  }

  save() {
    if (!this.user) return;
    this.auth.updateCurrentUser({
      name: this.model.name.trim() || this.user.name,
      email: this.model.email.trim().toLowerCase(),
    });
    this.saved = true;
    setTimeout(() => (this.saved = false), 1500);
  }
}
