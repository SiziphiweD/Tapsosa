import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-supplier-profile-edit-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-profile-edit-page.html',
  styleUrl: './supplier-profile-edit-page.css',
})
export class SupplierProfileEditPage {
  user: User | null = null;
  model = {
    name: '',
    company: '',
    email: '',
  };
  saved = false;

  constructor(private auth: AuthService) {
    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      if (u) {
        this.model = {
          name: u.name,
          company: u.company || '',
          email: u.email,
        };
      }
    });
  }

  get initial() {
    const base = this.model.company || this.user?.company || this.user?.name || '';
    return base ? base.charAt(0).toUpperCase() : '';
  }

  save() {
    if (!this.user) return;
    this.auth.updateCurrentUser({
      name: this.model.name.trim() || this.user.name,
      company: this.model.company.trim() || undefined,
      email: this.model.email.trim().toLowerCase(),
    });
    this.saved = true;
    setTimeout(() => (this.saved = false), 1500);
  }
}
