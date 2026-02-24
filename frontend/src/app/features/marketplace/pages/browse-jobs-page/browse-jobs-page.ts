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
    category: 'All Categories',
    location: '',
    minBudget: null as number | null,
    maxBudget: null as number | null,
    deadline: '',
    search: '',
    sortBy: 'Urgency (Soonest First)' as 
      'Urgency (Soonest First)' | 
      'Budget (High → Low)' | 
      'Budget (Low → High)' | 
      'Title (A–Z)',
  };

  jobs: Job[] = [];
  savedIds = new Set<string>();

  constructor() {
    this.savedIds = this.loadSaved();
    this.api.listJobs().subscribe((list: Job[]) => {
      this.jobs = list;
    });
  }

  get filtered() {
    const list = this.jobs.filter((j) => {
      // Category filter
      const byCategory = this.filters.category === 'All Categories' || 
                        j.category === this.filters.category;
      
      // Location filter
      const byLocation = this.filters.location.trim() === '' || 
                        j.location.toLowerCase().includes(this.filters.location.trim().toLowerCase());
      
      // Budget filters
      const byMin = this.filters.minBudget === null || 
                   j.minBudget >= this.filters.minBudget;
      const byMax = this.filters.maxBudget === null || 
                   j.maxBudget <= this.filters.maxBudget;
      
      // Deadline filter
      const byDeadline = this.filters.deadline === '' || 
                        this.daysLeft(j.bidDeadline) <= this.daysUntil(this.filters.deadline);
      
      // Search filter
      const searchTerm = this.filters.search.trim().toLowerCase();
      const bySearch = searchTerm === '' ||
        j.title.toLowerCase().includes(searchTerm) ||
        j.category.toLowerCase().includes(searchTerm) ||
        j.location.toLowerCase().includes(searchTerm) ||
        (j.requirements || '').toLowerCase().includes(searchTerm);
      
      return byCategory && byLocation && byMin && byMax && byDeadline && bySearch;
    });

    // Sort
    switch (this.filters.sortBy) {
      case 'Urgency (Soonest First)':
        return [...list].sort((a, b) => this.daysLeft(a.bidDeadline) - this.daysLeft(b.bidDeadline));
      case 'Budget (High → Low)':
        return [...list].sort((a, b) => b.maxBudget - a.maxBudget);
      case 'Budget (Low → High)':
        return [...list].sort((a, b) => a.maxBudget - b.maxBudget);
      case 'Title (A–Z)':
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
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
      category: 'All Categories',
      location: '',
      minBudget: null,
      maxBudget: null,
      deadline: '',
      search: '',
      sortBy: 'Urgency (Soonest First)',
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