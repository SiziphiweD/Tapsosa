import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job, Bid, Activity } from '../../../../shared/services/mock-api.service';

type SpendingRow = { label: string; total: number };

@Component({
  selector: 'app-member-reports-spending-page',
  imports: [CommonModule],
  templateUrl: './member-reports-spending-page.html',
  styleUrl: './member-reports-spending-page.css',
})
export class MemberReportsSpendingPage {
  jobs: Job[] = [];
  bids: Bid[] = [];
  activities: Activity[] = [];

  totalNet = 0;
  byCategory: SpendingRow[] = [];
  bySupplier: SpendingRow[] = [];
  byPeriod: SpendingRow[] = [];

  constructor(private api: MockApiService) {
    this.api.listJobs().subscribe((jobs: Job[]) => {
      this.jobs = jobs;
      this.refresh();
    });
    this.api.listAllBids().subscribe((bids: Bid[]) => {
      this.bids = bids;
      this.refresh();
    });
    this.api.listActivities().subscribe((acts: Activity[]) => {
      this.activities = acts;
      this.refresh();
    });
  }

  private refresh() {
    const completed = this.jobs.filter((j) => j.escrow && j.escrow.status === 'released');
    this.totalNet = completed.reduce((s, j) => s + j.escrow!.net, 0);

    const categoryTotals = new Map<string, number>();
    for (const job of completed) {
      const key = job.category || 'Uncategorised';
      const prev = categoryTotals.get(key) || 0;
      categoryTotals.set(key, prev + job.escrow!.net);
    }
    this.byCategory = Array.from(categoryTotals.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);

    const supplierTotals = new Map<string, number>();
    for (const job of completed) {
      const winningBid = job.escrow ? this.bids.find((b) => b.id === job.escrow!.bidId) : undefined;
      const name = winningBid?.supplierName || 'Unknown Supplier';
      const prev = supplierTotals.get(name) || 0;
      supplierTotals.set(name, prev + job.escrow!.net);
    }
    this.bySupplier = Array.from(supplierTotals.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);

    const periodTotals = new Map<string, number>();
    const releases = this.activities.filter((a) => a.type === 'escrow_released' && typeof a.amount === 'number');
    for (const act of releases) {
      const d = new Date(act.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const prev = periodTotals.get(key) || 0;
      periodTotals.set(key, prev + (act.amount || 0));
    }
    this.byPeriod = Array.from(periodTotals.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => (a.label < b.label ? -1 : 1));
  }
}
