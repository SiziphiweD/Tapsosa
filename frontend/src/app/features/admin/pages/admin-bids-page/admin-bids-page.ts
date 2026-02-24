import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockApiService, Bid, Job } from '../../../../shared/services/mock-api.service';

type Row = {
  id: string;
  jobId: string;
  jobTitle: string;
  supplierName: string;
  amount: number;
  days: number;
  submitted: string;
  status: 'Under Review' | 'Accepted' | 'Rejected';
};

@Component({
  selector: 'app-admin-bids-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bids-page.html',
  styleUrl: './admin-bids-page.css',
})
export class AdminBidsPage {
  private api = inject(MockApiService);

  rows: Row[] = [];
  query = '';
  status: 'All' | 'Under Review' | 'Accepted' | 'Rejected' = 'All';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listAllBids().subscribe((bids: Bid[]) => {
      this.api.listJobs().subscribe((jobs: Job[]) => {
        const rows: Row[] = bids.map((b) => {
          const job = jobs.find((j) => j.id === b.jobId);
          let status: Row['status'] = 'Under Review';
          if (job?.chosenBidId) {
            status = job.chosenBidId === b.id ? 'Accepted' : 'Rejected';
          }
          return {
            id: b.id,
            jobId: b.jobId,
            jobTitle: job?.title ?? b.jobId,
            supplierName: b.supplierName,
            amount: b.price,
            days: b.days,
            submitted: new Date(b.createdAt).toLocaleString(),
            status,
          };
        });
        this.rows = rows;
      });
    });
  }

  get filtered() {
    const q = this.query.trim().toLowerCase();
    return this.rows.filter((r) => {
      const matchesQ =
        !q ||
        r.jobTitle.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q);
      const matchesS = this.status === 'All' || r.status === this.status;
      return matchesQ && matchesS;
    });
  }
}
