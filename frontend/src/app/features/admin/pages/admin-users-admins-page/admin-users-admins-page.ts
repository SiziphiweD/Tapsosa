import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type AdminRow = { id: string; name: string; email: string; createdAt: string };

@Component({
  selector: 'app-admin-users-admins-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-admins-page.html',
  styleUrl: './admin-users-admins-page.css',
})
export class AdminUsersAdminsPage {
  rows: AdminRow[] = [];
  name = '';
  email = '';
  password = '';
  added = false;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      this.rows = users
        .filter((u) => u.role === 'admin')
        .map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }));
    } catch {
      this.rows = [];
    }
  }

  get canAdd() {
    return this.name.trim().length > 0 && this.email.includes('@') && this.password.length >= 6;
  }

  async addAdmin() {
    const user = {
      id: 'adm-' + Date.now(),
      role: 'admin',
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      passwordHash: await this.hash(this.password),
      createdAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      users.unshift(user);
      localStorage.setItem('tapsosa.users', JSON.stringify(users));
      this.name = this.email = this.password = '';
      this.added = true;
      this.load();
      setTimeout(() => (this.added = false), 2000);
    } catch {
      // ignore errors
    }
  }

  private async hash(password: string): Promise<string> {
    const enc = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
