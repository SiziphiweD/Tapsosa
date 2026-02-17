import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Job, Escrow, Activity, Bid } from '../../../../shared/services/mock-api.service';

type ActivityRow = {
  id: string;
  label: string;
  amount: number | null;
  when: string;
};

@Component({
  selector: 'app-member-transaction-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-transaction-detail-page.html',
  styleUrl: './member-transaction-detail-page.css',
})
export class MemberTransactionDetailPage {
  job: Job | undefined;
  escrow: Escrow | null = null;
  winningBid: Bid | null = null;
  activities: ActivityRow[] = [];

  constructor(private route: ActivatedRoute, private api: MockApiService) {
    const id = this.route.snapshot.paramMap.get('transactionId');
    if (!id) {
      return;
    }

    this.api.getJob(id).subscribe((job) => {
      this.job = job;
      this.escrow = job?.escrow ?? null;
      if (job?.id) {
        this.loadBid(job);
      }
    });

    this.api.listActivities().subscribe((acts: Activity[]) => {
      const filtered = acts.filter((a) => a.jobId === id);
      this.activities = filtered.map((a) => ({
        id: a.id,
        label:
          a.type === 'winner_selected'
            ? 'Winner Selected'
            : a.type === 'escrow_funded'
            ? 'Escrow Funded'
            : a.type === 'escrow_released'
            ? 'Escrow Released'
            : 'Bid Submitted',
        amount: a.amount ?? null,
        when: new Date(a.timestamp).toLocaleString(),
      }));
    });
  }

  get hasEscrow() {
    return !!this.escrow;
  }

  get statusText() {
    if (!this.escrow) return 'No Escrow';
    if (this.escrow.status === 'pending') return 'Awaiting Payment to Escrow';
    if (this.escrow.status === 'funded') return 'Funds in Escrow';
    return 'Payment Released to Supplier';
  }

  private loadBid(job: Job) {
    if (!job.chosenBidId) {
      this.winningBid = null;
      return;
    }
    this.api.listBids(job.id).subscribe((bids) => {
      this.winningBid = bids.find((b) => b.id === job.chosenBidId) ?? null;
    });
  }
}
