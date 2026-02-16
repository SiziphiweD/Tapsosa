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
    const data = this.load();
    this.pending = data.filter((d) => d.status === 'pending').length;
    this.approved = data.filter((d) => d.status === 'approved').length;
    this.rejected = data.filter((d) => d.status === 'rejected').length;
  }

  private load(): Verif[] {
    try {
      const raw = localStorage.getItem('tapsosa.verifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
