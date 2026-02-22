import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-pending-payouts-page',
  imports: [CommonModule],
  templateUrl: './pending-payouts-page.html',
  styleUrl: './pending-payouts-page.css',
})
export class PendingPayoutsPage {
  private api = inject(MockApiService);

  jobs: Job[] = [];
  total = 0;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const api = this.api;

    api.listJobs().subscribe((jobs) => {
      this.jobs = jobs.filter((j) => j.escrow?.status === 'funded');
      this.total = this.jobs.reduce((s, j) => s + (j.escrow?.net || 0), 0);
    });
  }
}
