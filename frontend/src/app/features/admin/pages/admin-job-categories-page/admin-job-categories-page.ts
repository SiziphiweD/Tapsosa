import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-job-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-job-categories-page.html',
  styleUrl: './admin-job-categories-page.css',
})
export class AdminJobCategoriesPage {
  private api = inject(MockApiService);
  categories: string[] = [];
  input = '';
  private jobs: Job[] = [];

  constructor() {
    this.load();
    this.api.listJobs().subscribe((jobs) => (this.jobs = jobs));
  }

  add() {
    const v = this.input.trim();
    if (!v) return;
    if (!this.categories.includes(v)) {
      this.categories.push(v);
      this.save();
    }
    this.input = '';
  }

  remove(idx: number) {
    this.categories.splice(idx, 1);
    this.save();
  }

  private load() {
    try {
      const raw = localStorage.getItem('tapsosa.job-categories');
      this.categories = raw ? JSON.parse(raw) : ['Guarding Services', 'Technology', 'Uniforms', 'Vehicles', 'Training'];
    } catch {
      this.categories = ['Guarding Services', 'Technology', 'Uniforms', 'Vehicles', 'Training'];
    }
  }

  private save() {
    localStorage.setItem('tapsosa.job-categories', JSON.stringify(this.categories));
  }

  exportCsv() {
    const counts = this.counts();
    const header = ['Category', 'Jobs'];
    const rows = this.categories.map((c) => [c, counts.get(c) || 0]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => String(v)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-categories.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private counts() {
    const m = new Map<string, number>();
    this.jobs.forEach((j) => m.set(j.category, (m.get(j.category) || 0) + 1));
    return m;
  }
}
