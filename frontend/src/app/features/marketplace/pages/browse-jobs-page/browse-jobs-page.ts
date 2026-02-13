import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-browse-jobs-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './browse-jobs-page.html',
  styleUrl: './browse-jobs-page.css',
})
export class BrowseJobsPage {

  filters = {
    category: 'All',
    location: '',
    minBudget: null as number | null,
    maxBudget: null as number | null,
    deadline: ''
  };

  jobs: Job[] = [];

  constructor(private api: MockApiService) {
    api.listJobs().subscribe((list: Job[]) => {
      this.jobs = list;
    });
  }

  get filtered() {
    return this.jobs.filter((j) => {
      const byCategory = this.filters.category === 'All' || j.category === this.filters.category;
      const byLocation = this.filters.location.trim() === '' || j.location.toLowerCase().includes(this.filters.location.trim().toLowerCase());
      const byMin = this.filters.minBudget === null || j.minBudget >= this.filters.minBudget;
      const byMax = this.filters.maxBudget === null || j.maxBudget <= this.filters.maxBudget!;
      const byDeadline = this.filters.deadline === '' || this.daysLeft(j.bidDeadline) <= this.daysUntil(this.filters.deadline);
      return byCategory && byLocation && byMin && byMax && byDeadline;
    });
  }

  daysUntil(dateStr: string) {
    const today = new Date();
    const d = new Date(dateStr);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  }
  daysLeft(dateStr: string) {
    return this.daysUntil(dateStr);
  }
}
