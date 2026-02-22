import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-finance-revenue-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-finance-revenue-page.html',
  styleUrl: './admin-finance-revenue-page.css',
})
export class AdminFinanceRevenuePage {
  private api = inject(MockApiService);

  totalGross = 0;
  totalFee = 0;
  totalNet = 0;
  fundedGross = 0;
  releasedNet = 0;
  rows: Array<{ title: string; status: string; gross: number; fee: number; net: number }> = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listJobs().subscribe((jobs: Job[]) => {
      const esc = jobs.filter((j) => j.escrow);
      this.rows = esc.map((j) => ({
        title: j.title,
        status: j.escrow!.status,
        gross: j.escrow!.gross,
        fee: j.escrow!.fee,
        net: j.escrow!.net,
      }));
      this.totalGross = esc.reduce((s, j) => s + j.escrow!.gross, 0);
      this.totalFee = esc.reduce((s, j) => s + j.escrow!.fee, 0);
      this.totalNet = esc.reduce((s, j) => s + j.escrow!.net, 0);
      this.fundedGross = esc.filter((j) => j.escrow!.status === 'funded').reduce((s, j) => s + j.escrow!.gross, 0);
      this.releasedNet = esc.filter((j) => j.escrow!.status === 'released').reduce((s, j) => s + j.escrow!.net, 0);
    });
  }
}
