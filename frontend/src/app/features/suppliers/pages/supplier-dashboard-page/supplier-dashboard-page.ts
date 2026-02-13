import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-dashboard-page',
  imports: [CommonModule],
  templateUrl: './supplier-dashboard-page.html',
  styleUrl: './supplier-dashboard-page.css',
})
export class SupplierDashboardPage {

  jobs: Job[] = [];
  pendingPayouts = 0;
  releasedPayouts = 0;
  fundedCount = 0;
  releasedCount = 0;
  recentActivities: Array<{ label: string; amount: number | null; jobTitle: string; when: string }> = [];

  constructor(private api: MockApiService) {
    api.listJobs().subscribe((jobs) => {
      this.jobs = jobs;
      const escrows = jobs.map((j) => j.escrow).filter((e): e is NonNullable<Job['escrow']> => !!e);
      this.pendingPayouts = escrows.filter((e) => e.status === 'funded').reduce((s, e) => s + e.net, 0);
      this.releasedPayouts = escrows.filter((e) => e.status === 'released').reduce((s, e) => s + e.net, 0);
      this.fundedCount = escrows.filter((e) => e.status === 'funded').length;
      this.releasedCount = escrows.filter((e) => e.status === 'released').length;
    });
    api.listActivities().subscribe((acts: Activity[]) => {
      this.recentActivities = acts
        .slice(0, 5)
        .map((a) => {
          const job = this.jobs.find((j) => j.id === a.jobId);
          const label =
            a.type === 'winner_selected'
              ? 'Winner Selected'
              : a.type === 'escrow_funded'
              ? 'Escrow Funded'
              : a.type === 'escrow_released'
              ? 'Escrow Released'
              : 'Bid Submitted';
          return {
            label,
            amount: a.amount ?? null,
            jobTitle: job?.title ?? a.jobId,
            when: new Date(a.timestamp).toLocaleString(),
          };
        });
    });
  }
}
