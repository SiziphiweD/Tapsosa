import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-contract-detail-page',
  imports: [CommonModule],
  templateUrl: './supplier-contract-detail-page.html',
  styleUrl: './supplier-contract-detail-page.css',
})
export class SupplierContractDetailPage {
  job?: Job;

  constructor(private route: ActivatedRoute, private api: MockApiService) {
    const id = this.route.snapshot.paramMap.get('jobId')!;
    this.api.listJobs().subscribe((jobs) => {
      this.job = jobs.find((j) => j.id === id);
    });
  }

  paymentStatus() {
    if (!this.job?.escrow) return 'Not started';
    const e = this.job.escrow;
    if (e.status === 'pending') return 'Awaiting Member Approval';
    if (e.status === 'funded') return 'Funds in Escrow - Awaiting Completion';
    return 'Funds Released - Processing Payment';
  }
}
