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
  private users: any[] = [];

  constructor() {
    this.api.listJobs().subscribe((jobs) => (this.jobs = jobs));
    this.loadUsers();
  }

  get filtered() {
    const q = this.query.trim().toLowerCase();
    return this.jobs.filter((j) => {
      const matchesQ =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q) ||
        (j.createdByName || '').toLowerCase().includes(q) ||
        (j.createdByEmail || '').toLowerCase().includes(q);
      
      const status = this.getJobStatus(j);
      const matchesS =
        this.status === 'All' ||
        (this.status === 'Unawarded' && status === 'Unawarded') ||
        (this.status === 'Pending' && status === 'Pending') ||
        (this.status === 'Funded' && status === 'Funded') ||
        (this.status === 'Released' && status === 'Released');
      
      return matchesQ && matchesS;
    });
  }

  getJobStatus(job: Job): string {
    if (job.escrow?.status === 'funded') return 'Funded';
    if (job.escrow?.status === 'released') return 'Released';
    if (job.escrow?.status === 'pending') return 'Pending';
    if (job.chosenBidId) return 'Pending';
    return 'Unawarded';
  }

  exportJobsCsv() {
    const rows = this.filtered.map((j) => {
      const u = this.findUser(j.createdById);
      const memberName = j.createdByName || u?.name || '';
      const memberCompany = u?.company || '';
      const memberEmail = j.createdByEmail || u?.email || '';
      return [
        j.title,
        memberName,
        memberCompany,
        memberEmail,
        j.category,
        j.minBudget,
        j.maxBudget,
        this.getJobStatus(j), // Use helper for consistent status
      ];
    });
    const header = ['Title', 'Requesting Member', 'Company', 'Email', 'Category', 'Min Budget', 'Max Budget', 'Status'];
    this.downloadCsv('jobs.csv', [header, ...rows]);
  }

  private downloadCsv(filename: string, rows: (string | number)[][]) {
    const csv = rows
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? '');
            if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  memberName(j: Job) {
    const u = this.findUser(j.createdById);
    return j.createdByName || u?.name || '—';
  }

  memberEmail(j: Job) {
    const u = this.findUser(j.createdById);
    return j.createdByEmail || u?.email || '';
  }

  memberCompany(j: Job) {
    const u = this.findUser(j.createdById);
    return u?.company || '';
  }

  private findUser(id?: string) {
    if (!id) return null;
    return this.users.find((u) => u.id === id) || null;
  }

  private loadUsers() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      this.users = raw ? JSON.parse(raw) : [];
    } catch {
      this.users = [];
    }
  }
}