import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job, Activity, Bid } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-member-reports-dashboard-page',
  imports: [CommonModule],
  templateUrl: './member-reports-dashboard-page.html',
  styleUrl: './member-reports-dashboard-page.css',
})
export class MemberReportsDashboardPage {
  jobs: Job[] = [];
  activities: Activity[] = [];
  bids: Bid[] = [];

  totalJobs = 0;
  completedJobs = 0;
  activeJobs = 0;
  completionRate = 0;

  averageFillDays: number | null = null;

  suppliersUsed = 0;
  topSupplier: string | null = null;

  constructor(private api: MockApiService) {
    this.api.listJobs().subscribe((jobs: Job[]) => {
      this.jobs = jobs;
      this.computeJobMetrics();
      this.computeFillTime();
    });
    this.api.listActivities().subscribe((acts: Activity[]) => {
      this.activities = acts;
      this.computeFillTime();
    });
    this.api.listAllBids().subscribe((bids: Bid[]) => {
      this.bids = bids;
      this.computeSupplierMetrics();
    });
  }

  private computeJobMetrics() {
    this.totalJobs = this.jobs.length;
    const withEscrow = this.jobs.filter((j) => !!j.escrow);
    this.completedJobs = withEscrow.filter((j) => j.escrow!.status === 'released').length;
    this.activeJobs = this.totalJobs - this.completedJobs;
    this.completionRate = this.totalJobs === 0 ? 0 : Math.round((this.completedJobs / this.totalJobs) * 100);
  }

  private computeFillTime() {
    if (this.jobs.length === 0 || this.activities.length === 0) {
      this.averageFillDays = null;
      return;
    }
    const perJob: number[] = [];
    for (const job of this.jobs) {
      const acts = this.activities.filter((a) => a.jobId === job.id);
      const firstBid = acts
        .filter((a) => a.type === 'bid_submitted')
        .reduce<Date | null>((min, a) => {
          const d = new Date(a.timestamp);
          return !min || d < min ? d : min;
        }, null);
      const winner = acts.find((a) => a.type === 'winner_selected');
      if (!firstBid || !winner) continue;
      const start = firstBid.getTime();
      const end = new Date(winner.timestamp).getTime();
      if (end <= start) continue;
      const days = (end - start) / 86400000;
      perJob.push(days);
    }
    if (perJob.length === 0) {
      this.averageFillDays = null;
      return;
    }
    const sum = perJob.reduce((s, d) => s + d, 0);
    this.averageFillDays = Math.round((sum / perJob.length) * 10) / 10;
  }

  private computeSupplierMetrics() {
    if (this.jobs.length === 0 || this.bids.length === 0) {
      this.suppliersUsed = 0;
      this.topSupplier = null;
      return;
    }
    const totals = new Map<string, number>();
    for (const job of this.jobs) {
      if (!job.escrow) continue;
      const winningBid = this.bids.find((b) => b.id === job.escrow!.bidId);
      const name = winningBid?.supplierName || 'Unknown Supplier';
      const prev = totals.get(name) || 0;
      totals.set(name, prev + job.escrow.net);
    }
    this.suppliersUsed = totals.size;
    let topName: string | null = null;
    let topTotal = 0;
    for (const [name, value] of totals.entries()) {
      if (value > topTotal) {
        topTotal = value;
        topName = name;
      }
    }
    this.topSupplier = topName;
  }
}
