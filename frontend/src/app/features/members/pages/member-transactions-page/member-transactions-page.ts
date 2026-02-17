import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

type MemberTransactionRow = {
  id: string;
  jobTitle: string;
  status: 'pending' | 'funded' | 'released';
  statusLabel: string;
  gross: number;
  fee: number;
  net: number;
  lastEvent: string | null;
  lastWhen: string | null;
};

@Component({
  selector: 'app-member-transactions-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-transactions-page.html',
  styleUrl: './member-transactions-page.css',
})
export class MemberTransactionsPage {
  rows: MemberTransactionRow[] = [];
  jobs: Job[] = [];
  activities: Activity[] = [];

  constructor(private api: MockApiService) {
    this.api.listJobs().subscribe((jobs: Job[]) => {
      this.jobs = jobs;
      this.refreshRows();
    });
    this.api.listActivities().subscribe((acts: Activity[]) => {
      this.activities = acts;
      this.refreshRows();
    });
  }

  get totalCount() {
    return this.rows.length;
  }

  get totalGross() {
    return this.rows.reduce((sum, r) => sum + r.gross, 0);
  }

  get totalNet() {
    return this.rows.reduce((sum, r) => sum + r.net, 0);
  }

  get pendingCount() {
    return this.rows.filter((r) => r.status === 'pending').length;
  }

  get fundedCount() {
    return this.rows.filter((r) => r.status === 'funded').length;
  }

  get releasedCount() {
    return this.rows.filter((r) => r.status === 'released').length;
  }

  private refreshRows() {
    const jobsWithEscrow = this.jobs.filter((j) => !!j.escrow);
    this.rows = jobsWithEscrow.map((job) => {
      const escrow = job.escrow!;
      const jobActs = this.activities.filter((a) => a.jobId === job.id);
      const latest = jobActs[0] ?? null;
      const lastEvent = latest
        ? latest.type === 'bid_submitted'
          ? 'Bid Submitted'
          : latest.type === 'winner_selected'
          ? 'Winner Selected'
          : latest.type === 'escrow_funded'
          ? 'Escrow Funded'
          : 'Escrow Released'
        : null;
      const lastWhen = latest ? new Date(latest.timestamp).toLocaleString() : null;
      const statusLabel =
        escrow.status === 'pending'
          ? 'Awaiting Payment to Escrow'
          : escrow.status === 'funded'
          ? 'Funds in Escrow'
          : 'Payment Released';
      return {
        id: job.id,
        jobTitle: job.title,
        status: escrow.status,
        statusLabel,
        gross: escrow.gross,
        fee: escrow.fee,
        net: escrow.net,
        lastEvent,
        lastWhen,
      };
    });
  }
}
