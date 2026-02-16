import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {
  membersCount = 0;
  suppliersCount = 0;
  activeJobsCount = 0;
  totalTransactionValue = 0;
  tapsosaRevenue = 0;
  completionRate = 0;
  escrowFundRate = 0;
  recent: Activity[] = [];

  constructor(private api: MockApiService) {
    this.loadUsersCounts();
    this.api.listJobs().subscribe((jobs: Job[]) => {
      const chosen = jobs.filter(j => !!j.chosenBidId);
      const active = jobs.filter(j => j.escrow && j.escrow.status !== 'released');
      const processed = jobs.filter(j => j.escrow && (j.escrow.status === 'funded' || j.escrow.status === 'released'));
      this.activeJobsCount = active.length;
      this.totalTransactionValue = processed.reduce((s, j) => s + (j.escrow!.gross || 0), 0);
      this.tapsosaRevenue = processed.reduce((s, j) => s + (j.escrow!.fee || 0), 0);
      const released = jobs.filter(j => j.escrow && j.escrow.status === 'released').length;
      this.completionRate = chosen.length === 0 ? 0 : Math.round((released / chosen.length) * 100);
      const fundedOrReleased = processed.length;
      this.escrowFundRate = chosen.length === 0 ? 0 : Math.round((fundedOrReleased / chosen.length) * 100);
    });
    this.api.listActivities().subscribe((acts) => {
      this.recent = acts.slice(0, 10);
    });
  }

  private loadUsersCounts() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users = raw ? JSON.parse(raw) as Array<{ role: string }> : [];
      this.membersCount = users.filter(u => u.role === 'member').length;
      this.suppliersCount = users.filter(u => u.role === 'supplier').length;
    } catch {
      this.membersCount = 0;
      this.suppliersCount = 0;
    }
  }
}
