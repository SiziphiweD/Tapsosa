import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Verif = { supplierId: string; type: string; status: 'pending' | 'approved' | 'rejected'; updatedAt: string };

@Component({
  selector: 'app-admin-compliance-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-compliance-dashboard-page.html',
  styleUrl: './admin-compliance-dashboard-page.css',
})
export class AdminComplianceDashboardPage {
  pending = 0;
  approved = 0;
  rejected = 0;

  constructor() {
    const { pending, approved, rejected } = this.computeFromUsers();
    this.pending = pending;
    this.approved = approved;
    this.rejected = rejected;
  }

  private computeFromUsers() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const relevant = users.filter((u) => u.role === 'supplier' || u.role === 'member');
      let pending = 0, approved = 0, rejected = 0;
      relevant.forEach((u) => {
        const s = String(u.status || 'Pending').toLowerCase();
        if (s === 'approved') approved++;
        else if (s === 'rejected') rejected++;
        else pending++;
      });
      return { pending, approved, rejected };
    } catch {
      return { pending: 0, approved: 0, rejected: 0 };
    }
  }
}
