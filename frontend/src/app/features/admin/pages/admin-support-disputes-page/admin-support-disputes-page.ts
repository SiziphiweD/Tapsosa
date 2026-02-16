import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Dispute = { id: string; jobId: string; reason: string; createdAt: string; resolved?: boolean };

@Component({
  selector: 'app-admin-support-disputes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-support-disputes-page.html',
  styleUrl: './admin-support-disputes-page.css',
})
export class AdminSupportDisputesPage {
  rows: Dispute[] = [];
  jobId = '';
  reason = '';

  constructor() {
    this.load();
  }

  get openCount() {
    return this.rows.filter((r) => !r.resolved).length;
  }

  toggle(id: string) {
    this.rows = this.rows.map((r) => (r.id === id ? { ...r, resolved: !r.resolved } : r));
    this.save();
  }

  add() {
    const jid = this.jobId.trim();
    const rsn = this.reason.trim();
    if (!jid || !rsn) return;
    const d: Dispute = { id: 'd-' + Date.now(), jobId: jid, reason: rsn, createdAt: new Date().toISOString(), resolved: false };
    this.rows = [d, ...this.rows];
    this.save();
    this.jobId = '';
    this.reason = '';
  }

  private load() {
    try {
      const raw = localStorage.getItem('tapsosa.disputes');
      this.rows = raw ? JSON.parse(raw) : [];
    } catch {
      this.rows = [];
    }
  }

  private save() {
    localStorage.setItem('tapsosa.disputes', JSON.stringify(this.rows));
  }
}
