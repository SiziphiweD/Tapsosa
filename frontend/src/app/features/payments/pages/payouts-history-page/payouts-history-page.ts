import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

type PayoutRow = {
  jobTitle: string;
  gross: number;
  fee: number;
  net: number;
  date: string;
  txnId: string;
};

@Component({
  selector: 'app-payouts-history-page',
  imports: [CommonModule],
  templateUrl: './payouts-history-page.html',
  styleUrl: './payouts-history-page.css',
})
export class PayoutsHistoryPage {
  rows: PayoutRow[] = [];

  constructor(private api: MockApiService) {
    this.api.listJobs().subscribe((jobs: Job[]) => {
      const released = jobs.filter((j) => j.escrow?.status === 'released');
      this.rows = released.map((j) => ({
        jobTitle: j.title,
        gross: j.escrow!.gross,
        fee: j.escrow!.fee,
        net: j.escrow!.net,
        date: new Date().toISOString().slice(0, 10),
        txnId: 'TX-' + j.id,
      }));
    });
  }
}
