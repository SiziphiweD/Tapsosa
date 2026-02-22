import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Job, Bid, Escrow } from '../../../../shared/services/mock-api.service';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-member-view-bids-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-view-bids-page.html',
  styleUrl: './member-view-bids-page.css',
})
export class MemberViewBidsPage {
  private route = inject(ActivatedRoute);
  private api = inject(MockApiService);
  private auth = inject(AuthService);

  job: Job | undefined;
  bids: Bid[] = [];
  selecting = false;
  selectedBidId: string | null = null;
  escrow: Escrow | null = null;
  success = false;
  warning: string | null = null;
  funding = false;
  releasing = false;

  isApproved = false;
  supplierStatusById: { [supplierId: string]: string } = {};
  complianceBySupplier: {
    [supplierId: string]: { label: string; completeness: number };
  } = {};

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {
    const current = this.auth.currentUser$.value as User | null;
    if (current) {
      const status = current.status || 'Pending';
      this.isApproved = status.toLowerCase() === 'approved';
    }

    const id = this.route.snapshot.paramMap.get('jobId');
    if (!id) {
      return;
    }

    this.api.getJob(id).subscribe((j) => {
      if (!j) {
        this.job = undefined;
        this.escrow = null;
        return;
      }
      this.job = j;
      this.escrow = j.escrow ?? null;
    });

    this.api.listBids(id).subscribe((b: Bid[]) => {
      this.bids = b;
      this.buildSupplierMeta(b);
    });
  }

  selectWinner(bidId: string) {
    if (!this.job) {
      return;
    }
    const bid = this.bids.find((b) => b.id === bidId);
    if (bid) {
      const status = this.getSupplierStatus(bid).toLowerCase();
      const supplierId = bid.supplierId;
      const complianceMeta = supplierId
        ? this.complianceBySupplier[supplierId]
        : undefined;
      const isFullyCompliant =
        status === 'approved' && complianceMeta?.label === 'Complete';
      this.warning = isFullyCompliant
        ? null
        : 'Warning: Selected supplier is not fully compliant on file. Ensure internal checks before proceeding.';
    } else {
      this.warning = null;
    }
    this.selecting = true;
    this.api.selectWinningBid(this.job.id, bidId).subscribe((j) => {
      if (!j) {
        this.selecting = false;
        return;
      }
      this.job = j;
      this.selecting = false;
      this.selectedBidId = bidId;
      this.success = true;
      this.escrow = j.escrow ?? null;
      setTimeout(() => {
        this.success = false;
      }, 3000);
    });
  }

  isWinner(bid: Bid) {
    return this.job?.chosenBidId === bid.id;
  }

  getSupplierStatus(bid: Bid): string {
    const id = bid.supplierId;
    if (!id) return 'Unknown';
    return this.supplierStatusById[id] || 'Unknown';
  }

  getComplianceLabel(bid: Bid): string {
    const id = bid.supplierId;
    if (!id) return 'No documents';
    const meta = this.complianceBySupplier[id];
    if (!meta) return 'No documents';
    return `${meta.label} • ${meta.completeness}%`;
  }

  getSupplierStatusClass(bid: Bid): string {
    const status = this.getSupplierStatus(bid).toLowerCase();
    if (status === 'approved') return 'chip-status-approved';
    if (status === 'rejected') return 'chip-status-rejected';
    if (status === 'pending') return 'chip-status-pending';
    return '';
  }

  getComplianceClass(bid: Bid): string {
    const id = bid.supplierId;
    if (!id) return 'chip-compliance-none';
    const meta = this.complianceBySupplier[id];
    if (!meta) return 'chip-compliance-none';
    if (meta.label === 'Complete') return 'chip-compliance-complete';
    if (meta.label === 'Partial') return 'chip-compliance-partial';
    return 'chip-compliance-none';
  }

  fundEscrow() {
    if (!this.job) {
      return;
    }
    this.funding = true;
    this.api.fundEscrow(this.job.id).subscribe((e) => {
      this.escrow = e;
      this.funding = false;
    });
  }

  releaseEscrow() {
    if (!this.job) {
      return;
    }
    this.releasing = true;
    this.api.releaseEscrow(this.job.id).subscribe((e) => {
      this.escrow = e;
      this.releasing = false;
    });
  }

  private buildSupplierMeta(bids: Bid[]) {
    const supplierIds = Array.from(
      new Set(bids.map((b) => b.supplierId).filter((id) => !!id))
    );
    if (supplierIds.length === 0) {
      this.supplierStatusById = {};
      this.complianceBySupplier = {};
      return;
    }

    let users: any[] = [];
    try {
      const rawUsers = localStorage.getItem('tapsosa.users');
      users = rawUsers ? JSON.parse(rawUsers) : [];
    } catch {
      users = [];
    }

    const statusById: { [supplierId: string]: string } = {};
    const complianceById: {
      [supplierId: string]: { label: string; completeness: number };
    } = {};

    supplierIds.forEach((id) => {
      const user = users.find((u) => u.id === id);
      const status = (user?.status || 'Pending') as string;
      statusById[id] = status;
      complianceById[id] = this.computeComplianceMeta(id);
    });

    this.supplierStatusById = statusById;
    this.complianceBySupplier = complianceById;
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
