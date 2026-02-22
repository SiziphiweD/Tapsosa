import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-jobs-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-jobs-page.html',
  styleUrl: './admin-jobs-page.css',
})
export class AdminJobsPage {
  private api = inject(MockApiService);

  query = '';
  status: 'All' | 'Unawarded' | 'Pending' | 'Funded' | 'Released' = 'All';
  jobs: Job[] = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listJobs().subscribe((jobs) => (this.jobs = jobs));
  }

  get filtered() {
    const q = this.query.trim().toLowerCase();
    return this.jobs.filter((j) => {
      const matchesQ = !q || j.title.toLowerCase().includes(q) || j.category.toLowerCase().includes(q);
      const st = j.escrow?.status || (j.chosenBidId ? 'pending' : 'unawarded');
      const matchesS =
        this.status === 'All' ||
        (this.status === 'Unawarded' && st === 'unawarded') ||
        (this.status === 'Pending' && st === 'pending') ||
        (this.status === 'Funded' && st === 'funded') ||
        (this.status === 'Released' && st === 'released');
      return matchesQ && matchesS;
    });
  }
}
