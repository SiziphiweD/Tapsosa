import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Job, Bid } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-job-detail-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './job-detail-page.html',
  styleUrl: './job-detail-page.css',
})
export class JobDetailPage {
  job: Job | undefined;
  bids: Bid[] = [];
  winningBid: Bid | undefined;

  supplierName = '';
  price: number | null = null;
  days: number | null = null;
  message = '';
  submitted = false;

  constructor(private route: ActivatedRoute, private api: MockApiService) {
    const id = route.snapshot.paramMap.get('jobId')!;
    api.getJob(id).subscribe((j) => {
      this.job = j;
      this.winningBid = j?.chosenBidId ? this.bids.find((b) => b.id === j.chosenBidId) : undefined;
    });
    api.listBids(id).subscribe((b) => {
      this.bids = b;
      this.winningBid = this.job?.chosenBidId ? b.find((x) => x.id === this.job!.chosenBidId) : undefined;
    });
  }

  get isValid() {
    return (
      this.supplierName.trim().length > 0 &&
      !!this.price &&
      !!this.days &&
      this.price! > 0 &&
      this.days! > 0 &&
      this.message.trim().length > 0
    );
  }

  submitBid() {
    if (!this.job || !this.isValid) return;
    this.api
      .createBid({
        jobId: this.job.id,
        supplierName: this.supplierName,
        price: this.price as number,
        days: this.days as number,
        message: this.message,
      })
      .subscribe(() => {
        this.submitted = true;
        this.supplierName = '';
        this.price = null;
        this.days = null;
        this.message = '';
        setTimeout(() => (this.submitted = false), 3000);
      });
  }

  daysLeft(dateStr: string | undefined) {
    if (!dateStr) return 0;
    const today = new Date();
    const d = new Date(dateStr);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  }
}
