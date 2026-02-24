import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

type MemberTransactionRow = {
  id: string;
  jobTitle: string;
  status: 'pending' | 'funded' | 'released';
  statusLabel: string;
  gross: number;
  fee: number;
  net: number;
  lastEvent: string | null;
  lastWhen: string | null;
  supplierName: string | null;
  supplierStatus: string | null;
  complianceLabel: string | null;
};

@Component({
  selector: 'app-member-transactions-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-transactions-page.html',
  styleUrl: './member-transactions-page.css',
})
export class MemberTransactionsPage {
  private api = inject(MockApiService);

  rows: MemberTransactionRow[] = [];
  jobs: Job[] = [];
  activities: Activity[] = [];

  constructor() {
    this.api.listJobs().subscribe((jobs: Job[]) => {
      this.jobs = jobs;
      this.refreshRows();
    });
    this.api.listActivities().subscribe((acts: Activity[]) => {
      this.activities = acts;
      this.refreshRows();
    });
  }

  get totalCount() {
    return this.rows.length;
  }

  get totalGross() {
    return this.rows.reduce((sum, r) => sum + r.gross, 0);
  }

  get totalNet() {
    return this.rows.reduce((sum, r) => sum + r.net, 0);
  }

  get pendingCount() {
    return this.rows.filter((r) => r.status === 'pending').length;
  }

  get fundedCount() {
    return this.rows.filter((r) => r.status === 'funded').length;
  }

  get releasedCount() {
    return this.rows.filter((r) => r.status === 'released').length;
  }

  // Helper for status icons
  getStatusIcon(status: string): string {
    switch(status) {
      case 'pending': return 'bi-hourglass-split';
      case 'funded': return 'bi-shield-lock';
      case 'released': return 'bi-check-circle-fill';
      default: return 'bi-question-circle';
    }
  }

  private refreshRows() {
    const jobsWithEscrow = this.jobs.filter((j) => !!j.escrow);
    this.rows = jobsWithEscrow.map((job) => {
      const escrow = job.escrow!;
      const jobActs = this.activities.filter((a) => a.jobId === job.id);
      const latest = jobActs[0] ?? null;
      
      const lastEvent = latest
        ? latest.type === 'bid_submitted'
          ? 'Bid Submitted'
          : latest.type === 'winner_selected'
          ? 'Winner Selected'
          : latest.type === 'escrow_funded'
          ? 'Escrow Funded'
          : 'Escrow Released'
        : null;
      
      const lastWhen = latest ? latest.timestamp : null;
      
      const statusLabel =
        escrow.status === 'pending'
          ? 'Awaiting Payment'
          : escrow.status === 'funded'
          ? 'Funds in Escrow'
          : 'Payment Released';
      
      const winningBidSupplier = this.getWinningBidSupplier(job.id);
      
      return {
        id: job.id,
        jobTitle: job.title,
        status: escrow.status,
        statusLabel,
        gross: escrow.gross,
        fee: escrow.fee,
        net: escrow.net,
        lastEvent,
        lastWhen,
        supplierName: winningBidSupplier.name,
        supplierStatus: winningBidSupplier.status,
        complianceLabel: winningBidSupplier.complianceLabel,
      };
    });
  }

  private getWinningBidSupplier(jobId: string): {
    name: string | null;
    status: string | null;
    complianceLabel: string | null;
  } {
    try {
      const rawJobs = localStorage.getItem('tapsosa.jobs');
      const jobs: any[] = rawJobs ? JSON.parse(rawJobs) : [];
      const job = jobs.find((j) => j.id === jobId);
      if (!job || !job.chosenBidId) {
        return { name: null, status: null, complianceLabel: null };
      }

      const rawBids = localStorage.getItem('tapsosa.bids');
      const bids: any[] = rawBids ? JSON.parse(rawBids) : [];
      const bid = bids.find((b) => b.id === job.chosenBidId);
      if (!bid || !bid.supplierId) {
        return { name: bid?.supplierName ?? null, status: null, complianceLabel: null };
      }

      const rawUsers = localStorage.getItem('tapsosa.users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      const user = users.find((u) => u.id === bid.supplierId);
      const status: string | null = (user?.status as string) || null;

      const compliance = this.computeComplianceMeta(bid.supplierId);
      const complianceLabel = compliance.label
        ? `${compliance.label}`
        : null;

      return {
        name: bid.supplierName ?? null,
        status,
        complianceLabel,
      };
    } catch {
      return { name: null, status: null, complianceLabel: null };
    }
  }

  private computeComplianceMeta(supplierId: string): {
    label: string;
    completeness: number;
  } {
    const key = `tapsosa.compliance.${supplierId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return { label: 'No docs', completeness: 0 };
      }
      const docs: Array<{ status?: string }> = JSON.parse(raw);
      if (!Array.isArray(docs) || docs.length === 0) {
        return { label: 'No docs', completeness: 0 };
      }
      const total = docs.length;
      const uploaded = docs.filter((d) => d.status === 'Uploaded').length;
      const completeness = total > 0 ? Math.round((uploaded / total) * 100) : 0;
      let label = 'No docs';
      if (uploaded === 0) {
        label = 'No docs';
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