import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

type Report = { id: string; name: string; dataset: string; createdAt: string };

@Component({
  selector: 'app-admin-analytics-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-analytics-reports-page.html',
  styleUrl: './admin-analytics-reports-page.css',
})
export class AdminAnalyticsReportsPage {
  usersTotal = 0;
  suppliersTotal = 0;
  membersTotal = 0;
  jobsTotal = 0;
  txVolume = 0;
  feeTotal = 0;
  jobsByCategory: Record<string, number> = {};
  jobsByLocation: Record<string, number> = {};
  recent: Activity[] = [];

  reportName = '';
  dataset = 'transactions';
  savedReports: Report[] = [];

  constructor(private api: MockApiService) {
    this.loadUsers();
    this.api.listJobs().subscribe((jobs: Job[]) => {
      this.jobsTotal = jobs.length;
      this.jobsByCategory = jobs.reduce((acc: any, j) => {
        acc[j.category] = (acc[j.category] || 0) + 1;
        return acc;
      }, {});
      this.jobsByLocation = jobs.reduce((acc: any, j) => {
        acc[j.location] = (acc[j.location] || 0) + 1;
        return acc;
      }, {});
      const esc = jobs.filter((j) => j.escrow);
      this.txVolume = esc.reduce((s, j) => s + j.escrow!.gross, 0);
      this.feeTotal = esc.reduce((s, j) => s + j.escrow!.fee, 0);
    });
    this.api.listActivities().subscribe((a) => (this.recent = a.slice(0, 10)));
    this.loadReports();
  }

  saveReport() {
    if (!this.reportName.trim()) return;
    const r: Report = { id: 'rep-' + Date.now(), name: this.reportName.trim(), dataset: this.dataset, createdAt: new Date().toISOString() };
    this.savedReports = [r, ...this.savedReports];
    localStorage.setItem('tapsosa.reports.saved', JSON.stringify(this.savedReports));
    this.reportName = '';
    this.dataset = 'transactions';
  }

  deleteReport(id: string) {
    this.savedReports = this.savedReports.filter((r) => r.id !== id);
    localStorage.setItem('tapsosa.reports.saved', JSON.stringify(this.savedReports));
  }

  private loadUsers() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      this.usersTotal = users.length;
      this.suppliersTotal = users.filter((u) => u.role === 'supplier').length;
      this.membersTotal = users.filter((u) => u.role === 'member').length;
    } catch {}
  }

  private loadReports() {
    try {
      const raw = localStorage.getItem('tapsosa.reports.saved');
      this.savedReports = raw ? JSON.parse(raw) : [];
    } catch {
      this.savedReports = [];
    }
  }
}
