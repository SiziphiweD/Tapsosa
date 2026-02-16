import { Component } from '@angular/core';
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
  type: 'all' | 'bid_submitted' | 'winner_selected' | 'escrow_funded' | 'escrow_released' = 'all';
  rows: Activity[] = [];

  constructor(private api: MockApiService) {
    this.api.listActivities().subscribe((a) => (this.rows = a));
  }

  get filtered() {
    if (this.type === 'all') return this.rows;
    return this.rows.filter((r) => r.type === this.type);
  }
}
