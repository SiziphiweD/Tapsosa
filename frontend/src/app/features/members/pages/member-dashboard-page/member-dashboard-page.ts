import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job, Activity, Bid } from '../../../../shared/services/mock-api.service';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-member-dashboard-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-dashboard-page.html',
  styleUrl: './member-dashboard-page.css',
})
export class MemberDashboardPage {

  jobs: Job[] = [];
  bids: Bid[] = [];
  bidsCount = 0;
  complianceAlerts = 0;
  pendingCount = 0;
  fundedCount = 0;
  releasedCount = 0;
  pendingGross = 0;
  fundedGross = 0;
  releasedNet = 0;
  activeJobs = 0;
  recentActivities: Array<{ label: string; amount: number | null; jobTitle: string; when: string }> = [];

  status: string = 'Pending';
  isApproved = false;

  private api = inject(MockApiService);
  private auth = inject(AuthService);

  constructor() {
    const current = this.auth.currentUser$.value as User | null;
    if (current) {
      this.status = current.status || 'Pending';
      this.isApproved = (this.status || '').toLowerCase() === 'approved';
    }

    const api = this.api;

    api.listJobs().subscribe((jobs) => {
      this.jobs = jobs;
      const escrows = jobs.map((j) => j.escrow).filter((e): e is NonNullable<Job['escrow']> => !!e);
      this.pendingCount = escrows.filter((e) => e.status === 'pending').length;
      this.fundedCount = escrows.filter((e) => e.status === 'funded').length;
      this.releasedCount = escrows.filter((e) => e.status === 'released').length;
      this.pendingGross = escrows.filter((e) => e.status === 'pending').reduce((s, e) => s + e.gross, 0);
      this.fundedGross = escrows.filter((e) => e.status === 'funded').reduce((s, e) => s + e.gross, 0);
      this.releasedNet = escrows.filter((e) => e.status === 'released').reduce((s, e) => s + e.net, 0);
      this.activeJobs = this.jobs.filter((j) => !j.escrow || j.escrow.status !== 'released').length;
      this.refreshBidsCount();
    });
    api.listAllBids().subscribe((bids: Bid[]) => {
      this.bids = bids;
      this.refreshBidsCount();
    });
    api.listActivities().subscribe((acts: Activity[]) => {
      this.recentActivities = acts
        .slice(0, 5)
        .map((a) => {
          const job = this.jobs.find((j) => j.id === a.jobId);
          const label =
            a.type === 'winner_selected'
              ? 'Winner Selected'
              : a.type === 'escrow_funded'
              ? 'Escrow Funded'
              : a.type === 'escrow_released'
              ? 'Escrow Released'
              : 'Bid Submitted';
          return {
            label,
            amount: a.amount ?? null,
            jobTitle: job?.title ?? a.jobId,
            when: new Date(a.timestamp).toLocaleString(),
          };
        });
      this.refreshComplianceAlerts();
    });
  }

  private refreshBidsCount() {
    if (this.jobs.length === 0 || this.bids.length === 0) {
      this.bidsCount = 0;
      return;
    }
    const pendingJobIds = new Set(
      this.jobs
        .filter((j) => !j.escrow || j.escrow.status !== 'released')
        .map((j) => j.id)
    );
    this.bidsCount = this.bids.filter((b) => pendingJobIds.has(b.jobId)).length;
  }

  private refreshComplianceAlerts() {
    if (this.jobs.length === 0) {
      this.complianceAlerts = 0;
      return;
    }

    let nonCompliantCount = 0;

    try {
      const rawJobs = localStorage.getItem('tapsosa.jobs');
      const jobsStorage: any[] = rawJobs ? JSON.parse(rawJobs) : [];
      const rawBids = localStorage.getItem('tapsosa.bids');
      const bidsStorage: any[] = rawBids ? JSON.parse(rawBids) : [];
      const rawUsers = localStorage.getItem('tapsosa.users');
      const usersStorage: any[] = rawUsers ? JSON.parse(rawUsers) : [];

      const releasedJobIds = new Set(
        this.jobs.filter((j) => j.escrow && j.escrow.status === 'released').map((j) => j.id)
      );

      releasedJobIds.forEach((jobId) => {
        const job = jobsStorage.find((j) => j.id === jobId);
        if (!job || !job.chosenBidId) {
          return;
        }
        const bid = bidsStorage.find((b) => b.id === job.chosenBidId);
        if (!bid) {
          return;
        }
        const user = usersStorage.find((u) => u.id === bid.supplierId);
        const status = (user?.status || 'Pending') as string;
        const compliance = this.computeComplianceMeta(bid.supplierId);
        const isFullyCompliant =
          status.toLowerCase() === 'approved' && compliance.label === 'Complete';
        if (!isFullyCompliant) {
          nonCompliantCount += 1;
        }
      });
    } catch {
      nonCompliantCount = 0;
    }

    this.complianceAlerts = nonCompliantCount;
  }

  private computeComplianceMeta(supplierId: string): {
    label: string;
    completeness: number;
  } {
    const key = `tapsosa.compliance.${supplierId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return { label: 'No documents', completeness: 0 };
      }
      const docs: Array<{ status?: string }> = JSON.parse(raw);
      if (!Array.isArray(docs) || docs.length === 0) {
        return { label: 'No documents', completeness: 0 };
      }
      const total = docs.length;
      const uploaded = docs.filter((d) => d.status === 'Uploaded').length;
      const completeness = total > 0 ? Math.round((uploaded / total) * 100) : 0;
      let label = 'No documents';
      if (uploaded === 0) {
        label = 'No documents';
      } else if (uploaded === total) {
        label = 'Complete';
      } else {
        label = 'Partial';
      }
      return { label, completeness };
    } catch {
      return { label: 'Unknown', completeness: 0 };
    }
  }
}
