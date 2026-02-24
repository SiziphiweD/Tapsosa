import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-finance-escrow-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-finance-escrow-page.html',
  styleUrl: './admin-finance-escrow-page.css',
})
export class AdminFinanceEscrowPage {
  private api = inject(MockApiService);

  pending: Job[] = [];
  funded: Job[] = [];
  released: Job[] = [];

  constructor() {
    this.api.listJobs().subscribe((jobs) => {
      this.pending = jobs.filter((j) => j.escrow?.status === 'pending');
      this.funded = jobs.filter((j) => j.escrow?.status === 'funded');
      this.released = jobs.filter((j) => j.escrow?.status === 'released');
    });
  }

  getPendingTotal(): number {
    return this.pending.reduce((sum, job) => sum + (job.escrow?.gross || 0), 0);
  }

  getFundedTotal(): number {
    return this.funded.reduce((sum, job) => sum + (job.escrow?.gross || 0), 0);
  }

  getReleasedTotal(): number {
    return this.released.reduce((sum, job) => sum + (job.escrow?.net || 0), 0);
  }
}