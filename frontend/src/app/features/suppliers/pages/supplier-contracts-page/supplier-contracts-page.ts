import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-contracts-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-contracts-page.html',
  styleUrl: './supplier-contracts-page.css',
})
export class SupplierContractsPage {
  ongoing: Job[] = [];

  constructor(private api: MockApiService) {
    this.api.listJobs().subscribe((jobs) => {
      this.ongoing = jobs.filter((j) => !!j.escrow && (j.escrow!.status === 'pending' || j.escrow!.status === 'funded'));
    });
  }

  statusText(job: Job) {
    const e = job.escrow!;
    if (e.status === 'pending') return 'Awaiting Member Payment';
    if (e.status === 'funded') return 'Funds in Escrow - Awaiting Completion';
    return 'Funds Released - Processing Payment';
  }
}
