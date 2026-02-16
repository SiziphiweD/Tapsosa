import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Bid, Job } from '../../../../shared/services/mock-api.service';

type BidRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  amount: number;
  submitted: string;
  status: 'Under Review' | 'Accepted' | 'Rejected';
};

@Component({
  selector: 'app-supplier-bids-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-bids-page.html',
  styleUrl: './supplier-bids-page.css',
})
export class SupplierBidsPage {
  rows: BidRow[] = [];
  tab: 'Active' | 'Accepted' | 'Rejected' | 'Drafts' = 'Active';

  constructor(private api: MockApiService) {
    this.api.listAllBids().subscribe((bids: Bid[]) => {
      this.api.listJobs().subscribe((jobs: Job[]) => {
        this.rows = bids.map((b) => {
          const job = jobs.find((j) => j.id === b.jobId);
          let status: BidRow['status'] = 'Under Review';
          if (job?.chosenBidId) {
            status = job.chosenBidId === b.id ? 'Accepted' : 'Rejected';
          }
          return {
            id: b.id,
            jobId: b.jobId,
            jobTitle: job?.title ?? b.jobId,
            amount: b.price,
            submitted: new Date().toLocaleString(),
            status,
          };
        });
      });
    });
  }

  get active() { return this.rows.filter(r => r.status === 'Under Review'); }
  get accepted() { return this.rows.filter(r => r.status === 'Accepted'); }
  get rejected() { return this.rows.filter(r => r.status === 'Rejected'); }
  get drafts() {
    const raw = localStorage.getItem('tapsosa.draft-bids');
    if (!raw) return [];
    try {
      const arr: any[] = JSON.parse(raw);
      return arr.map(d => ({
        id: d.id,
        jobId: d.jobId,
        jobTitle: d.jobId,
        amount: d.price || 0,
        submitted: d.createdAt,
        status: 'Under Review' as const,
      }));
    } catch { return []; }
  }

  get totalCount() { return this.rows.length; }
  get winRate() { return this.rows.length === 0 ? 0 : Math.round((this.accepted.length / this.rows.length) * 100); }
  get avgAmount() {
    if (this.rows.length === 0) return 0;
    const sum = this.rows.reduce((s, r) => s + r.amount, 0);
    return Math.round(sum / this.rows.length);
  }
}
