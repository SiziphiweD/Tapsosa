import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job, Bid } from '../../../../shared/services/mock-api.service';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-earnings-overview-page',
  imports: [CommonModule],
  templateUrl: './earnings-overview-page.html',
  styleUrl: './earnings-overview-page.css',
})
export class EarningsOverviewPage implements OnInit {
  totalGross = 0;
  totalFees = 0;
  netPayout = 0;
  loading = true;
  success = false;
  user: User | null = null;

  constructor(private api: MockApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      this.compute();
    });
  }

  private compute() {
    this.loading = true;
    this.totalGross = 0;
    this.totalFees = 0;
    this.netPayout = 0;
    this.api.listJobs().subscribe((jobs: Job[]) => {
      if (!this.user || this.user.role !== 'supplier') {
        this.loading = false;
        return;
      }
      const supplierName = this.user.name;
      const relevant = jobs.filter((j) => j.escrow && j.escrow.status === 'released' && j.chosenBidId);
      if (relevant.length === 0) {
        this.loading = false;
        return;
      }
      let pendingLookups = relevant.length;
      relevant.forEach((job) => {
        this.api.listBids(job.id).subscribe((bids: Bid[]) => {
          const win = bids.find((b) => b.id === job.chosenBidId);
          if (win && win.supplierName === supplierName && job.escrow) {
            this.totalGross += job.escrow.gross;
            this.totalFees += job.escrow.fee;
            this.netPayout += job.escrow.net;
          }
          pendingLookups -= 1;
          if (pendingLookups === 0) {
            this.loading = false;
          }
        });
      });
    });
  }

  withdraw() {
    this.success = true;
    setTimeout(() => (this.success = false), 3000);
  }
}
