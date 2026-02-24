import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockApiService, Activity } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-finance-transactions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-finance-transactions-page.html',
  styleUrl: './admin-finance-transactions-page.css',
})
export class AdminFinanceTransactionsPage {
  private api = inject(MockApiService);

  type: 'all' | 'bid_submitted' | 'winner_selected' | 'escrow_funded' | 'escrow_released' = 'all';
  rows: Activity[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listActivities().subscribe((a) => (this.rows = a));
  }

  get filtered() {
    if (this.type === 'all') return this.rows;
    return this.rows.filter((r) => r.type === this.type);
  }

  exportCsv() {
    const header = ['Type', 'Job', 'Amount', 'Timestamp'];
    const rows = this.filtered.map((r) => [r.type, r.jobId, r.amount ?? '', r.timestamp]);
    const csv = [header, ...rows].map((r) => r.map((v) => String(v)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Charts removed per requirement; CSV export retained.
}
