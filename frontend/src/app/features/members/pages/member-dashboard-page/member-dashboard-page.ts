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

    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.api.listJobs().subscribe((jobs) => {
      this.jobs = jobs;
      
      // Filter jobs for this member (if you have member-specific data)
      // For now, we'll use all jobs
      const escrows = jobs.map((j) => j.escrow).filter((e): e is NonNullable<Job['escrow']> => !!e);
      
      this.pendingCount = escrows.filter((e) => e.status === 'pending').length;
      this.fundedCount = escrows.filter((e) => e.status === 'funded').length;
      this.releasedCount = escrows.filter((e) => e.status === 'released').length;
      
      this.pendingGross = escrows
        .filter((e) => e.status === 'pending')
        .reduce((s, e) => s + e.gross, 0);
      
      this.fundedGross = escrows
        .filter((e) => e.status === 'funded')
        .reduce((s, e) => s + e.gross, 0);
      
      this.releasedNet = escrows
        .filter((e) => e.status === 'released')
        .reduce((s, e) => s + e.net, 0);
      
      this.activeJobs = this.jobs.filter(
        (j) => !j.escrow || j.escrow.status !== 'released'
      ).length;
      
      this.refreshBidsCount();
      this.refreshComplianceAlerts();
    });

    this.api.listAllBids().subscribe((bids: Bid[]) => {
      this.bids = bids;
      this.refreshBidsCount();
    });
  }

  private refreshBidsCount() {
    if (this.jobs.length === 0 || this.bids.length === 0) {
      this.bidsCount = 0;
      return;
    }
    
    // Get active job IDs (not released)
    const activeJobIds = new Set(
      this.jobs
        .filter((j) => !j.escrow || j.escrow.status !== 'released')
        .map((j) => j.id)
    );
    
    // Count bids for active jobs
    this.bidsCount = this.bids.filter((b) => activeJobIds.has(b.jobId)).length;
  }

  private refreshComplianceAlerts() {
    // Count suppliers with compliance issues on released jobs
    let nonCompliantCount = 0;

    try {
      const releasedJobs = this.jobs.filter(
        (j) => j.escrow && j.escrow.status === 'released'
      );

      releasedJobs.forEach((job) => {
        if (!job.chosenBidId) return;
        
        const bid = this.bids.find((b) => b.id === job.chosenBidId);
        if (!bid) return;

        const supplierCompliance = this.checkSupplierCompliance(bid.supplierId);
        if (!supplierCompliance) {
          nonCompliantCount++;
        }
      });
    } catch {
      nonCompliantCount = 0;
    }

    this.complianceAlerts = nonCompliantCount;
  }

  private checkSupplierCompliance(supplierId: string): boolean {
    try {
      const key = `tapsosa.compliance.${supplierId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      
      const docs = JSON.parse(raw);
      if (!Array.isArray(docs)) return false;
      
      // Check if all required docs are uploaded
      const uploaded = docs.filter((d: any) => d.status === 'Uploaded').length;
      return uploaded === docs.length;
    } catch {
      return false;
    }
  }
}