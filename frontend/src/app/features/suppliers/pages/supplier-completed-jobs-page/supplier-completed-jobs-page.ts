import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-completed-jobs-page',
  imports: [CommonModule],
  templateUrl: './supplier-completed-jobs-page.html',
  styleUrl: './supplier-completed-jobs-page.css',
})
export class SupplierCompletedJobsPage {
  private api = inject(MockApiService);

  completed: Job[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listJobs().subscribe((jobs) => {
      this.completed = jobs.filter((j) => j.escrow?.status === 'released');
    });
  }
}
