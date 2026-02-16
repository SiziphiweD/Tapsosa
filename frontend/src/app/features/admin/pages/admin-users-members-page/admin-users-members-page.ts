import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type UserRow = { id: string; name: string; email: string; createdAt: string; suspended?: boolean };

@Component({
  selector: 'app-admin-users-members-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-members-page.html',
  styleUrl: './admin-users-members-page.css',
})
export class AdminUsersMembersPage {
  query = '';
  rows: UserRow[] = [];

  constructor() {
    this.load();
  }

  get filtered() {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }

  private load() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      this.rows = users
        .filter((u) => u.role === 'member')
        .map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }));
    } catch {
      this.rows = [];
    }
  }

  suspend(id: string) {
    // placeholder: toggle suspended in-memory
    this.rows = this.rows.map((r) => (r.id === id ? { ...r, suspended: !r.suspended } : r));
  }
}
