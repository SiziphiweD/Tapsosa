import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Bid, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-bid-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-bid-detail-page.html',
  styleUrl: './supplier-bid-detail-page.css',
})
export class SupplierBidDetailPage {
  bid?: Bid;
  job?: Job;
  status = 'Under Review';

  constructor(private route: ActivatedRoute, private api: MockApiService) {
    const id = this.route.snapshot.paramMap.get('bidId')!;
    this.api.listAllBids().subscribe((bids) => {
      this.bid = bids.find((b) => b.id === id);
      if (this.bid) {
        this.api.listJobs().subscribe((jobs) => {
          this.job = jobs.find((j) => j.id === this.bid!.jobId);
          if (this.job?.chosenBidId) {
            this.status = this.job.chosenBidId === this.bid!.id ? 'Accepted' : 'Rejected';
          }
        });
      }
    });
  }
}
