import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-supplier-jobs-saved-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-jobs-saved-page.html',
  styleUrl: './supplier-jobs-saved-page.css',
})
export class SupplierJobsSavedPage {
  private api = inject(MockApiService);

  jobs: Job[] = [];
  savedIds = new Set<string>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.savedIds = this.loadSaved();
    this.api.listJobs().subscribe((jobs) => {
      this.jobs = jobs.filter((j) => this.savedIds.has(j.id));
    });
  }

  private loadSaved(): Set<string> {
    const raw = localStorage.getItem('tapsosa.saved.jobs');
    if (!raw) return new Set();
    try { return new Set(JSON.parse(raw)); } catch { return new Set(); }
  }
}
