import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Job, Escrow, Activity, Bid } from '../../../../shared/services/mock-api.service';

type ActivityRow = {
  id: string;
  label: string;
  amount: number | null;
  when: string;
};

@Component({
  selector: 'app-member-transaction-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-transaction-detail-page.html',
  styleUrl: './member-transaction-detail-page.css',
})
export class MemberTransactionDetailPage {
  private route = inject(ActivatedRoute);
  private api = inject(MockApiService);

  job: Job | undefined;
  escrow: Escrow | null = null;
  winningBid: Bid | null = null;
  activities: ActivityRow[] = [];
  supplierStatus: string | null = null;
  complianceLabel: string | null = null;
  supplierStatusClass = '';
  complianceClass = '';

  constructor() {
    const id = this.route.snapshot.paramMap.get('transactionId');
    if (!id) {
      return;
    }

    this.api.getJob(id).subscribe((job) => {
      this.job = job;
      this.escrow = job?.escrow ?? null;
      if (job?.id) {
        this.loadBid(job);
      }
    });

    this.api.listActivities().subscribe((acts: Activity[]) => {
      const filtered = acts
        .filter((a) => a.jobId === id)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      this.activities = filtered.map((a) => ({
        id: a.id,
        label:
          a.type === 'winner_selected'
            ? 'Winner Selected'
            : a.type === 'escrow_funded'
            ? 'Escrow Funded'
            : a.type === 'escrow_released'
            ? 'Escrow Released'
            : 'Bid Submitted',
        amount: a.amount ?? null,
        when: new Date(a.timestamp).toLocaleString(),
      }));
    });
  }

  get hasEscrow() {
    return !!this.escrow;
  }

  get statusText() {
    if (!this.escrow) return 'No Escrow';
    if (this.escrow.status === 'pending') return 'Awaiting Payment to Escrow';
    if (this.escrow.status === 'funded') return 'Funds in Escrow';
    return 'Payment Released to Supplier';
  }

  get lastEvent(): ActivityRow | null {
    if (this.activities.length === 0) return null;
    return this.activities[0];
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

  private loadBid(job: Job) {
    if (!job.chosenBidId) {
      this.winningBid = null;
      this.supplierStatus = null;
      this.complianceLabel = null;
      this.supplierStatusClass = '';
      this.complianceClass = '';
      return;
    }
    
    this.api.listBids(job.id).subscribe((bids) => {
      const bid = bids.find((b) => b.id === job.chosenBidId) ?? null;
      this.winningBid = bid;
      
      if (!bid || !bid.supplierId) {
        this.supplierStatus = null;
        this.complianceLabel = null;
        this.supplierStatusClass = '';
        this.complianceClass = '';
        return;
      }

      let users: any[] = [];
      try {
        const rawUsers = localStorage.getItem('tapsosa.users');
        users = rawUsers ? JSON.parse(rawUsers) : [];
      } catch {
        users = [];
      }

      const user = users.find((u) => u.id === bid.supplierId);
      const status = (user?.status || 'Pending') as string;
      this.supplierStatus = status;
      
      const meta = this.computeComplianceMeta(bid.supplierId);
      this.complianceLabel = `${meta.label}`;
      
      this.supplierStatusClass = this.mapStatusClass(status);
      this.complianceClass = this.mapComplianceClass(meta.label);
    });
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

  private mapStatusClass(status: string): string {
    const value = status.toLowerCase();
    if (value === 'approved') return 'chip-status-approved';
    if (value === 'rejected') return 'chip-status-rejected';
    if (value === 'pending') return 'chip-status-pending';
    return '';
  }

  private mapComplianceClass(label: string): string {
    if (label === 'Complete') return 'chip-compliance-complete';
    if (label === 'Partial') return 'chip-compliance-partial';
    return 'chip-compliance-none';
  }
}