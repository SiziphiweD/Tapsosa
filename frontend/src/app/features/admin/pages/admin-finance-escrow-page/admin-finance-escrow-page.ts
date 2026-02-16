import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-finance-escrow-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-finance-escrow-page.html',
  styleUrl: './admin-finance-escrow-page.css',
})
export class AdminFinanceEscrowPage {
  pending: Job[] = [];
  funded: Job[] = [];
  released: Job[] = [];

  constructor(private api: MockApiService) {
    this.api.listJobs().subscribe((jobs) => {
      this.pending = jobs.filter((j) => j.escrow?.status === 'pending');
      this.funded = jobs.filter((j) => j.escrow?.status === 'funded');
      this.released = jobs.filter((j) => j.escrow?.status === 'released');
    });
  }
}
