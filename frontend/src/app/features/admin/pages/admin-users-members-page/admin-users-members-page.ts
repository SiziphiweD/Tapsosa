import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type UserRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: string;
  statusReason?: string;
};

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
  rejectingId: string | null = null;
  rejectReason = '';

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
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
          status: u.status || 'Pending',
          statusReason: u.statusReason,
        }));
    } catch {
      this.rows = [];
    }
  }

  setStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected', statusReason?: string) {
    this.rows = this.rows.map((r) => (r.id === id ? { ...r, status, statusReason } : r));
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const updated = users.map((u) => (u.id === id ? { ...u, status, statusReason } : u));
      localStorage.setItem('tapsosa.users', JSON.stringify(updated));
    } catch {}
  }

  statusClass(status?: string) {
    const value = (status || 'Pending').toLowerCase();
    if (value === 'approved') return 'approved';
    if (value === 'rejected') return 'rejected';
    return 'pending';
  }

  view(id: string) {
    try {
      console.log('View member', id);
    } catch {}
  }

  openReject(id: string) {
    this.rejectingId = id;
    this.rejectReason = '';
  }

  closeReject() {
    this.rejectingId = null;
    this.rejectReason = '';
  }

  confirmReject() {
    if (!this.rejectingId) return;
    const reason = this.rejectReason.trim();
    this.setStatus(this.rejectingId, 'Rejected', reason || undefined);
    this.closeReject();
  }
}
