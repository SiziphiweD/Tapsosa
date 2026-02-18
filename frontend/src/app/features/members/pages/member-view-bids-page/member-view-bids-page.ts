import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Job, Bid, Escrow } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-member-view-bids-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-view-bids-page.html',
  styleUrl: './member-view-bids-page.css',
})
export class MemberViewBidsPage {
  job: Job | undefined;
  bids: Bid[] = [];
  selecting = false;
  selectedBidId: string | null = null;
  success = false;
  escrow: Escrow | null | undefined = null;
  funding = false;
  releasing = false;

  constructor(private route: ActivatedRoute, private api: MockApiService) {
    const id = route.snapshot.paramMap.get('jobId')!;
    api.getJob(id).subscribe((j) => {
      this.job = j;
      this.escrow = j?.escrow ?? null;
    });
    api.listBids(id).subscribe((b) => (this.bids = b));
  }

  selectWinner(bidId: string) {
    if (!this.job) return;
    this.selecting = true;
    this.api.selectWinningBid(this.job.id, bidId).subscribe((j) => {
      this.job = j;
      this.selecting = false;
      this.selectedBidId = bidId;
      this.success = true;
      this.escrow = j?.escrow ?? null;
      setTimeout(() => (this.success = false), 3000);
    });
  }

  isWinner(bid: Bid) {
    return this.job?.chosenBidId === bid.id;
  }

  fundEscrow() {
    if (!this.job) return;
    this.funding = true;
    this.api.fundEscrow(this.job.id).subscribe((e) => {
      this.escrow = e;
      this.funding = false;
    });
  }

  releaseEscrow() {
    if (!this.job) return;
    this.releasing = true;
    this.api.releaseEscrow(this.job.id).subscribe((e) => {
      this.escrow = e;
      this.releasing = false;
    });
  }
}
