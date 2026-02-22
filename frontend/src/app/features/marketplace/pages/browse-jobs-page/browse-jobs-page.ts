import { Component, inject } from '@angular/core';
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
  private api = inject(MockApiService);


  filters = {
    category: 'All',
    location: '',
    minBudget: null as number | null,
    maxBudget: null as number | null,
    deadline: '',
    search: '',
    sortBy: 'Urgency' as 'Urgency' | 'Budget (High→Low)' | 'Budget (Low→High)' | 'Title (A–Z)',
  };

  jobs: Job[] = [];
  savedIds = new Set<string>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const api = this.api;

    this.savedIds = this.loadSaved();
    api.listJobs().subscribe((list: Job[]) => {
      this.jobs = list;
    });
  }

  get filtered() {
    const list = this.jobs.filter((j) => {
      const byCategory = this.filters.category === 'All' || j.category === this.filters.category;
      const byLocation = this.filters.location.trim() === '' || j.location.toLowerCase().includes(this.filters.location.trim().toLowerCase());
      const byMin = this.filters.minBudget === null || j.minBudget >= this.filters.minBudget;
      const byMax = this.filters.maxBudget === null || j.maxBudget <= this.filters.maxBudget!;
      const byDeadline = this.filters.deadline === '' || this.daysLeft(j.bidDeadline) <= this.daysUntil(this.filters.deadline);
      const bySearch =
        this.filters.search.trim() === '' ||
        j.title.toLowerCase().includes(this.filters.search.trim().toLowerCase()) ||
        j.category.toLowerCase().includes(this.filters.search.trim().toLowerCase()) ||
        j.location.toLowerCase().includes(this.filters.search.trim().toLowerCase()) ||
        (j.requirements || '').toLowerCase().includes(this.filters.search.trim().toLowerCase());
      return byCategory && byLocation && byMin && byMax && byDeadline && bySearch;
    });
    if (this.filters.sortBy === 'Urgency') {
      return [...list].sort((a, b) => this.daysLeft(a.bidDeadline) - this.daysLeft(b.bidDeadline));
    }
    if (this.filters.sortBy === 'Budget (High→Low)') {
      return [...list].sort((a, b) => b.maxBudget - a.maxBudget);
    }
    if (this.filters.sortBy === 'Budget (Low→High)') {
      return [...list].sort((a, b) => a.maxBudget - b.maxBudget);
    }
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
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

  resetFilters() {
    this.filters = {
      category: 'All',
      location: '',
      minBudget: null,
      maxBudget: null,
      deadline: '',
      search: '',
      sortBy: 'Urgency',
    };
  }

  isSaved(job: Job) {
    return this.savedIds.has(job.id);
  }

  toggleSave(job: Job) {
    const key = 'tapsosa.saved.jobs';
    const raw = localStorage.getItem(key);
    let arr: string[] = [];
    if (raw) {
      try { arr = JSON.parse(raw); } catch {}
    }
    const idx = arr.indexOf(job.id);
    if (idx >= 0) {
      arr.splice(idx, 1);
      this.savedIds.delete(job.id);
    } else {
      arr.unshift(job.id);
      arr = Array.from(new Set(arr));
      this.savedIds = new Set(arr);
    }
    localStorage.setItem(key, JSON.stringify(arr));
  }

  private loadSaved(): Set<string> {
    const raw = localStorage.getItem('tapsosa.saved.jobs');
    if (!raw) return new Set();
    try { return new Set(JSON.parse(raw)); } catch { return new Set(); }
  }
}
