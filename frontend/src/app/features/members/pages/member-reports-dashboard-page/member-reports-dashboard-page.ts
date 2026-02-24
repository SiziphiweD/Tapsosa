import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../../../shared/services/auth.service';

type MemberComplianceStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

type MemberComplianceDoc = {
  key: string;
  name: string;
  status: 'Not Uploaded' | 'Uploaded';
  expiry?: string;
  uploadedAt?: string;
};

@Component({
  selector: 'app-member-reports-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './member-reports-dashboard-page.html',
  styleUrl: './member-reports-dashboard-page.css',
})
export class MemberReportsDashboardPage {
  private auth = inject(AuthService);

  user: User | null = null;
  docs: MemberComplianceDoc[] = [];

  constructor() {
    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      this.docs = this.loadDocs(u?.id);
    });
  }

  get complianceStatus(): MemberComplianceStatus {
    const raw = (this.user?.status || 'Pending') as MemberComplianceStatus;
    if (raw === 'Under Review' || raw === 'Approved' || raw === 'Rejected') {
      return raw;
    }
    return 'Pending';
  }

  get documentsUploaded() {
    return this.docs.filter((d) => d.status === 'Uploaded').length;
  }

  get totalRequiredDocs() {
    return this.docs.length;
  }

  get expiredCount() {
    return this.docs.filter((d) => this.isExpired(d)).length;
  }

  get expiringSoonCount() {
    return this.docs.filter((d) => !this.isExpired(d) && this.isExpiringSoon(d)).length;
  }

  get lastSubmissionDate(): string | null {
    const uploaded = this.docs.filter((d) => d.uploadedAt);
    if (uploaded.length === 0) return null;
    
    const latest = uploaded.reduce((latestDoc, doc) => {
      if (!latestDoc.uploadedAt) return doc;
      if (!doc.uploadedAt) return latestDoc;
      return new Date(doc.uploadedAt) > new Date(latestDoc.uploadedAt) ? doc : latestDoc;
    });
    
    return latest.uploadedAt || null;
  }

  private baseDocs(): MemberComplianceDoc[] {
    return [
      { key: 'businessRegistrationCertificate', name: 'Business Registration Certificate', status: 'Not Uploaded' },
      { key: 'taxClearanceCertificate', name: 'Tax Clearance Certificate', status: 'Not Uploaded' },
      { key: 'industryComplianceCertificate', name: 'Industry Compliance Certificate', status: 'Not Uploaded' },
      { key: 'directorIdCopy', name: 'Director ID copy', status: 'Not Uploaded' },
      { key: 'proofOfAddress', name: 'Proof of Address', status: 'Not Uploaded' },
    ];
  }

  private loadDocs(userId: string | undefined): MemberComplianceDoc[] {
    const base = this.baseDocs();
    if (!userId) return base;
    
    const key = `tapsosa.memberCompliance.${userId}`;
    const raw = localStorage.getItem(key);
    
    if (!raw) return base;
    
    try {
      const saved = JSON.parse(raw) as MemberComplianceDoc[];
      return base.map((d) => saved.find((s) => s.key === d.key) || d);
    } catch {
      return base;
    }
  }

  isExpired(doc: MemberComplianceDoc): boolean {
    if (!doc.expiry) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(doc.expiry);
    expiry.setHours(0, 0, 0, 0);
    
    return expiry.getTime() < today.getTime();
  }

  isExpiringSoon(doc: MemberComplianceDoc): boolean {
    if (!doc.expiry) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(doc.expiry);
    expiry.setHours(0, 0, 0, 0);
    
    if (expiry.getTime() <= today.getTime()) return false;
    
    const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30; // Expiring within 30 days
  }

  // Helper to get status icon
  getStatusIcon(status: string): string {
    switch(status) {
      case 'Approved': return 'bi-check-circle-fill';
      case 'Rejected': return 'bi-exclamation-triangle-fill';
      case 'Under Review': return 'bi-clock-history';
      default: return 'bi-hourglass-split';
    }
  }
}