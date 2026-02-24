import { Component, inject } from '@angular/core';
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
  private api = inject(MockApiService);

  jobs: Job[] = [];
  bids: Bid[] = [];
  activities: Activity[] = [];

  totalNet = 0;
  byCategory: SpendingRow[] = [];
  bySupplier: SpendingRow[] = [];
  byPeriod: SpendingRow[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Load jobs
    this.api.listJobs().subscribe((jobs: Job[]) => {
      this.jobs = jobs;
      this.refresh();
    });

    // Load all bids
    this.api.listAllBids().subscribe((bids: Bid[]) => {
      this.bids = bids;
      this.refresh();
    });

    // Load activities
    this.api.listActivities().subscribe((acts: Activity[]) => {
      this.activities = acts;
      this.refresh();
    });
  }

  private refresh() {
    // Get completed jobs (released escrow)
    const completed = this.jobs.filter((j) => j.escrow && j.escrow.status === 'released');
    
    // Calculate total net spend
    this.totalNet = completed.reduce((s, j) => s + (j.escrow?.net || 0), 0);

    // By Category
    this.calculateByCategory(completed);
    
    // By Supplier
    this.calculateBySupplier(completed);
    
    // By Time Period
    this.calculateByPeriod();
  }

  private calculateByCategory(completed: Job[]) {
    const categoryTotals = new Map<string, number>();
    
    for (const job of completed) {
      const key = job.category || 'Uncategorised';
      const prev = categoryTotals.get(key) || 0;
      categoryTotals.set(key, prev + (job.escrow?.net || 0));
    }
    
    this.byCategory = Array.from(categoryTotals.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);
  }

  private calculateBySupplier(completed: Job[]) {
    const supplierTotals = new Map<string, number>();
    
    for (const job of completed) {
      if (!job.escrow) continue;
      
      // Find the winning bid for this job
      const winningBid = this.bids.find((b) => b.id === job.escrow?.bidId);
      const name = winningBid?.supplierName || 'Unknown Supplier';
      
      const prev = supplierTotals.get(name) || 0;
      supplierTotals.set(name, prev + (job.escrow?.net || 0));
    }
    
    this.bySupplier = Array.from(supplierTotals.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);
  }

  private calculateByPeriod() {
    const periodTotals = new Map<string, number>();
    
    // Filter for escrow released activities with amounts
    const releases = this.activities.filter(
      (a) => a.type === 'escrow_released' && typeof a.amount === 'number'
    );
    
    for (const act of releases) {
      const d = new Date(act.timestamp);
      // Format as YYYY-MM for grouping by month
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      // Format label as "Month YYYY" (e.g., "February 2024")
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      
      const prev = periodTotals.get(label) || 0;
      periodTotals.set(label, prev + (act.amount || 0));
    }
    
    this.byPeriod = Array.from(periodTotals.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => {
        // Sort by date descending (newest first)
        const dateA = new Date(a.label);
        const dateB = new Date(b.label);
        return dateB.getTime() - dateA.getTime();
      });
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return `R${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
}