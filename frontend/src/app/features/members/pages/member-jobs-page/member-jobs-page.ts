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
  loading = true;

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Load jobs
    this.api.listJobs().subscribe((jobs) => {
      this.jobs = jobs;
      this.loading = false;
    });

    // Load bids and count per job
    this.api.listAllBids().subscribe((bids: Bid[]) => {
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

    // If job has a winner and escrow is released → Closed
    if (hasWinner && escrowStatus === 'released') {
      return 'Closed';
    }

    // If job has a winner and escrow is pending/funded → Awarded
    if (hasWinner && (escrowStatus === 'pending' || escrowStatus === 'funded')) {
      return 'Awarded';
    }

    // If no winner and deadline not passed → Open
    if (!hasWinner && deadline.getTime() > now.getTime()) {
      return 'Open';
    }

    // Default to Closed
    return 'Closed';
  }

  // Optional: Get status color for styling
  getStatusColor(status: 'Open' | 'Awarded' | 'Closed'): string {
    switch (status) {
      case 'Open': return '#10b981'; // Green
      case 'Awarded': return '#f59e0b'; // Amber
      case 'Closed': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  }

  // Optional: Format date for display
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}