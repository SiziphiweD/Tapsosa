import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

type UserRow = { id: string; name: string; email: string; company?: string; createdAt: string; status: string; statusReason?: string };

@Component({
  selector: 'app-admin-users-suppliers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-users-suppliers-page.html',
  styleUrl: './admin-users-suppliers-page.css',
})
export class AdminUsersSuppliersPage {
  private router = inject(Router);
  private auth = inject(AuthService);
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
    return this.rows.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.company || '').toLowerCase().includes(q)
    );
  }

  private load() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      this.rows = users
        .filter((u) => u.role === 'supplier')
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          company: u.company,
          createdAt: u.createdAt,
          status: u.status || 'Pending',
          statusReason: u.statusReason,
        }));
    } catch {
      this.rows = [];
    }
  }

  statusClass(status?: string) {
    const value = (status || 'Pending').toLowerCase();
    if (value === 'approved') return 'approved';
    if (value === 'rejected') return 'rejected';
    return 'pending';
  }

  setStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected', statusReason?: string) {
    this.rows = this.rows.map((r) => (r.id === id ? { ...r, status, statusReason } : r));
    this.auth.updateUserById(id, { status, statusReason });
    try {
      const raw = localStorage.getItem('tapsosa.verifications');
      const verifs: Array<{ supplierId: string; type: string; status: 'pending' | 'approved' | 'rejected'; updatedAt: string }> =
        raw ? JSON.parse(raw) : [];
      const filtered = verifs.filter((v) => v.supplierId !== id || v.type !== 'supplier');
      filtered.push({
        supplierId: id,
        type: 'supplier',
        status: status.toLowerCase() as 'pending' | 'approved' | 'rejected',
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem('tapsosa.verifications', JSON.stringify(filtered));
    } catch {}
  }

  view(id: string) {
    this.router.navigateByUrl(`/admin/users/suppliers/${id}`);
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
