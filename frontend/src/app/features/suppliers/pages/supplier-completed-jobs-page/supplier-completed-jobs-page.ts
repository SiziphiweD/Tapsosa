import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-completed-jobs-page',
  imports: [CommonModule],
  templateUrl: './supplier-completed-jobs-page.html',
  styleUrl: './supplier-completed-jobs-page.css',
})
export class SupplierCompletedJobsPage {
  completed: Job[] = [];

  constructor(private api: MockApiService) {
    this.api.listJobs().subscribe((jobs) => {
      this.completed = jobs.filter((j) => j.escrow?.status === 'released');
    });
  }
}
