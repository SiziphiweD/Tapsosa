import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type UserRow = { id: string; name: string; email: string; company?: string; createdAt: string; suspended?: boolean };

@Component({
  selector: 'app-admin-users-suppliers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-suppliers-page.html',
  styleUrl: './admin-users-suppliers-page.css',
})
export class AdminUsersSuppliersPage {
  query = '';
  rows: UserRow[] = [];

  constructor() {
    this.load();
  }

  get filtered() {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((r) =>
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.company || '').toLowerCase().includes(q)
    );
  }

  private load() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      this.rows = users
        .filter((u) => u.role === 'supplier')
        .map((u) => ({ id: u.id, name: u.name, email: u.email, company: u.company, createdAt: u.createdAt }));
    } catch {
      this.rows = [];
    }
  }

  suspend(id: string) {
    this.rows = this.rows.map((r) => (r.id === id ? { ...r, suspended: !r.suspended } : r));
  }
}
