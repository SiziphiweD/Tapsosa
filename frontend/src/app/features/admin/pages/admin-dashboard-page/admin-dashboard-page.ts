import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job, Activity } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {
  private api = inject(MockApiService);

  membersCount = 0;
  suppliersCount = 0;
  verifiedMembers = 0;
  verifiedSuppliers = 0;
  activeJobsCount = 0;
  totalTransactionValue = 0;
  tapsosaRevenue = 0;
  completionRate = 0;
  escrowFundRate = 0;
  disputeRate = 0;
  activeEscrows = 0;
  pendingVerifications = 0;
  recent: Activity[] = [];

  constructor() {
    this.loadUsersCounts();
    this.loadVerificationStats();
    this.api.listJobs().subscribe((jobs: Job[]) => {
      const chosen = jobs.filter(j => !!j.chosenBidId);
      const active = jobs.filter(j => j.escrow && j.escrow.status !== 'released');
      const processed = jobs.filter(j => j.escrow && (j.escrow.status === 'funded' || j.escrow.status === 'released'));
      
      // Calculate dispute rate from disputes data (if available in your API)
      // For now, we'll set a placeholder or calculate from mock data
      this.disputeRate = 0; // You can update this when you have dispute data
      
      this.activeJobsCount = active.length;
      this.activeEscrows = active.length;
      this.totalTransactionValue = processed.reduce((s, j) => s + (j.escrow!.gross || 0), 0);
      this.tapsosaRevenue = processed.reduce((s, j) => s + (j.escrow!.fee || 0), 0);
      
      const released = jobs.filter(j => j.escrow && j.escrow.status === 'released').length;
      this.completionRate = chosen.length === 0 ? 0 : Math.round((released / chosen.length) * 100);
      
      const fundedOrReleased = processed.length;
      this.escrowFundRate = chosen.length === 0 ? 0 : Math.round((fundedOrReleased / chosen.length) * 100);
      
      // Try to load disputes from localStorage if available
      this.loadDisputeRate();
    });
    
    this.api.listActivities().subscribe((acts) => {
      this.recent = acts.slice(0, 10);
    });
  }

  private loadUsersCounts() {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users = raw ? JSON.parse(raw) as Array<{ role: string; status?: string }> : [];
      
      this.membersCount = users.filter(u => u.role === 'member').length;
      this.suppliersCount = users.filter(u => u.role === 'supplier').length;
      
      // Verified users (approved status)
      this.verifiedMembers = users.filter(u => u.role === 'member' && u.status === 'Approved').length;
      this.verifiedSuppliers = users.filter(u => u.role === 'supplier' && u.status === 'Approved').length;
      
    } catch {
      this.membersCount = 0;
      this.suppliersCount = 0;
      this.verifiedMembers = 0;
      this.verifiedSuppliers = 0;
    }
  }

  private loadVerificationStats() {
    try {
      // Load verifications from localStorage
      const raw = localStorage.getItem('tapsosa.verifications');
      const verifications = raw ? JSON.parse(raw) : [];
      
      // Count pending verifications
      this.pendingVerifications = verifications.filter((v: any) => v.status === 'pending').length;
      
    } catch {
      this.pendingVerifications = 0;
    }
  }

  private loadDisputeRate() {
    try {
      // Try to load disputes from localStorage if you have a disputes store
      const raw = localStorage.getItem('tapsosa.disputes');
      const disputes = raw ? JSON.parse(raw) : [];
      
      // Calculate dispute rate based on total jobs with escrows
      if (disputes.length > 0) {
        // You can adjust this calculation based on your data structure
        this.disputeRate = Math.min(Math.round((disputes.length / 50) * 100), 5); // Cap at 5% for demo
      } else {
        // Default demo value
        this.disputeRate = 2; // 2% default for demo
      }
    } catch {
      this.disputeRate = 2; // Default fallback
    }
  }

  // Helper method to calculate verification rate
  getVerificationRate(type: 'members' | 'suppliers'): number {
    if (type === 'members') {
      return this.membersCount === 0 ? 0 : Math.round((this.verifiedMembers / this.membersCount) * 100);
    } else {
      return this.suppliersCount === 0 ? 0 : Math.round((this.verifiedSuppliers / this.suppliersCount) * 100);
    }
  }
}