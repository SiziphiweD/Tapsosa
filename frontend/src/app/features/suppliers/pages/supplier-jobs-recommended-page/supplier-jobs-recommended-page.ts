import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job, Bid } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-jobs-recommended-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-jobs-recommended-page.html',
  styleUrl: './supplier-jobs-recommended-page.css',
})
export class SupplierJobsRecommendedPage {
  private api = inject(MockApiService);

  jobs: Job[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listJobs().subscribe((jobs) => {
      this.jobs = [...jobs].sort((a, b) => b.maxBudget - a.maxBudget).slice(0, 12);
    });
  }
}
