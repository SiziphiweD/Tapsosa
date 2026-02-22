import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

type SupplierTransactionRow = {
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
  selector: 'app-supplier-transactions-page',
  imports: [CommonModule],
  templateUrl: './supplier-transactions-page.html',
  styleUrl: './supplier-transactions-page.css',
})
export class SupplierTransactionsPage {
  private api = inject(MockApiService);

  rows: SupplierTransactionRow[] = [];
  jobs: Job[] = [];
  activities: Activity[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
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

  get pendingCount() {
    return this.rows.filter((r) => r.status === 'pending').length;
  }

  get fundedCount() {
    return this.rows.filter((r) => r.status === 'funded').length;
  }

  get releasedCount() {
    return this.rows.filter((r) => r.status === 'released').length;
  }

  get totalPendingNet() {
    return this.rows
      .filter((r) => r.status === 'funded')
      .reduce((sum, r) => sum + r.net, 0);
  }

  get totalReleasedNet() {
    return this.rows
      .filter((r) => r.status === 'released')
      .reduce((sum, r) => sum + r.net, 0);
  }

  private refreshRows() {
    const jobsWithEscrow = this.jobs.filter((j) => !!j.escrow);
    this.rows = jobsWithEscrow.map((job) => {
      const escrow = job.escrow!;
      const jobActs = this.activities.filter((a) => a.jobId === job.id);
      const latest = jobActs[0] ?? null;
      const lastEvent = latest
        ? latest.type === 'winner_selected'
          ? 'Winner Selected'
          : latest.type === 'escrow_funded'
          ? 'Escrow Funded'
          : latest.type === 'escrow_released'
          ? 'Escrow Released'
          : 'Bid Submitted'
        : null;
      const lastWhen = latest ? new Date(latest.timestamp).toLocaleString() : null;
      const statusLabel =
        escrow.status === 'pending'
          ? 'Awaiting Member Payment'
          : escrow.status === 'funded'
          ? 'Funds in Escrow'
          : 'Paid Out';
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
