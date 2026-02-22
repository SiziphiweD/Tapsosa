import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

type AuditRow = {
  id: string;
  jobTitle: string;
  jobId: string;
  status: 'pending' | 'funded' | 'released';
  gross: number;
  net: number;
  lastEvent: string | null;
  lastWhen: string | null;
  eventsCount: number;
};

@Component({
  selector: 'app-transaction-audit-page',
  imports: [CommonModule],
  templateUrl: './transaction-audit-page.html',
  styleUrl: './transaction-audit-page.css',
})
export class TransactionAuditPage {
  private api = inject(MockApiService);

  rows: AuditRow[] = [];
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

  get totalGross() {
    return this.rows.reduce((sum, r) => sum + r.gross, 0);
  }

  get totalNet() {
    return this.rows.reduce((sum, r) => sum + r.net, 0);
  }

  get totalTransactions() {
    return this.rows.length;
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
      return {
        id: job.id,
        jobTitle: job.title,
        jobId: job.id,
        status: escrow.status,
        gross: escrow.gross,
        net: escrow.net,
        lastEvent,
        lastWhen,
        eventsCount: jobActs.length,
      };
    });
  }
}
