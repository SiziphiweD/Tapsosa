import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job, Bid } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-member-jobs-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-jobs-page.html',
  styleUrl: './member-jobs-page.css',
})
export class MemberJobsPage {
  private api = inject(MockApiService);

  jobs: Job[] = [];
  bidsByJob: Record<string, number> = {};

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {
    const api = this.api;

    api.listJobs().subscribe((jobs) => (this.jobs = jobs));
    api.listAllBids().subscribe((bids: Bid[]) => {
      const counts: Record<string, number> = {};
      for (const b of bids) {
        counts[b.jobId] = (counts[b.jobId] || 0) + 1;
      }
      this.bidsByJob = counts;
    });
  }

  getStatus(job: Job): 'Open' | 'Awarded' | 'Closed' {
    const now = new Date();
    const deadline = new Date(job.bidDeadline);
    const hasWinner = !!job.chosenBidId;
    const escrowStatus = job.escrow?.status;

    if (!hasWinner && deadline.getTime() > now.getTime()) {
      return 'Open';
    }

    if (hasWinner && escrowStatus !== 'released') {
      return 'Awarded';
    }

    return 'Closed';
  }
}
