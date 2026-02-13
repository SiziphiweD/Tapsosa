import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-member-dashboard-page',
  imports: [CommonModule],
  templateUrl: './member-dashboard-page.html',
  styleUrl: './member-dashboard-page.css',
})
export class MemberDashboardPage {

  jobs: Job[] = [];
  pendingCount = 0;
  fundedCount = 0;
  releasedCount = 0;
  pendingGross = 0;
  fundedGross = 0;
  releasedNet = 0;
  recentActivities: Array<{ label: string; amount: number | null; jobTitle: string; when: string }> = [];

  constructor(private api: MockApiService) {
    api.listJobs().subscribe((jobs) => {
      this.jobs = jobs;
      const escrows = jobs.map((j) => j.escrow).filter((e): e is NonNullable<Job['escrow']> => !!e);
      this.pendingCount = escrows.filter((e) => e.status === 'pending').length;
      this.fundedCount = escrows.filter((e) => e.status === 'funded').length;
      this.releasedCount = escrows.filter((e) => e.status === 'released').length;
      this.pendingGross = escrows.filter((e) => e.status === 'pending').reduce((s, e) => s + e.gross, 0);
      this.fundedGross = escrows.filter((e) => e.status === 'funded').reduce((s, e) => s + e.gross, 0);
      this.releasedNet = escrows.filter((e) => e.status === 'released').reduce((s, e) => s + e.net, 0);
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
