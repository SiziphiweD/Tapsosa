import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type SupplierRow = {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
  status: string;
  statusReason?: string;
  documents: Array<{
    key: string;
    name: string;
    status: string;
    fileName?: string;
    uploadedAt?: string;
  }>;
  completeness: number;
};

type VerificationRecord = {
  supplierId: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  updatedAt: string;
};

@Component({
  selector: 'app-supplier-verification-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-verification-page.html',
  styleUrl: './supplier-verification-page.css',
})
export class SupplierVerificationPage {
  query = '';
  rows: SupplierRow[] = [];
  rejectingId: string | null = null;
  rejectReason = '';

  constructor() {
    this.load();
  }

  get filtered() {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.company || '').toLowerCase().includes(q)
    );
  }

  statusClass(status?: string) {
    const value = (status || 'Pending').toLowerCase();
    if (value === 'approved') return 'approved';
    if (value === 'rejected') return 'rejected';
    return 'pending';
  }

  approve(id: string) {
    this.setStatus(id, 'Approved');
  }

  openReject(id: string) {
    this.rejectingId = id;
    this.rejectReason = '';
  }

  closeReject() {
    this.rejectingId = null;
    this.rejectReason = '';
  }

  confirmReject() {
    if (!this.rejectingId) return;
    const reason = this.rejectReason.trim();
    this.setStatus(this.rejectingId, 'Rejected', reason || undefined);
    this.closeReject();
  }

  private load() {
    try {
      const rawUsers = localStorage.getItem('tapsosa.users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      this.rows = users
        .filter((u) => u.role === 'supplier')
        .map((u) => {
          const docs = this.loadDocs(u.id);
          const total = docs.length || 1;
          const uploaded = docs.filter((d) => d.status === 'Uploaded').length;
          const completeness = Math.round((uploaded / total) * 100);
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            company: u.company,
            createdAt: u.createdAt,
            status: u.status || 'Pending',
            statusReason: u.statusReason,
            documents: docs,
            completeness,
          } as SupplierRow;
        });
    } catch {
      this.rows = [];
    }
  }

  private setStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected', statusReason?: string) {
    const now = new Date().toISOString();
    this.rows = this.rows.map((r) =>
      r.id === id ? { ...r, status, statusReason } : r
    );
    try {
      const rawUsers = localStorage.getItem('tapsosa.users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      const updatedUsers = users.map((u) =>
        u.id === id ? { ...u, status, statusReason } : u
      );
      localStorage.setItem('tapsosa.users', JSON.stringify(updatedUsers));

      const rawVerif = localStorage.getItem('tapsosa.verifications');
      const verifs: VerificationRecord[] = rawVerif ? JSON.parse(rawVerif) : [];
      const filtered = verifs.filter((v) => v.supplierId !== id);
      filtered.push({
        supplierId: id,
        type: 'supplier',
        status: status.toLowerCase() as VerificationRecord['status'],
        updatedAt: now,
      });
      localStorage.setItem('tapsosa.verifications', JSON.stringify(filtered));
    } catch {}
  }

  private loadDocs(userId: string): SupplierRow['documents'] {
    const key = `tapsosa.compliance.${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return [
          { key: 'psira', name: 'PSiRA Registration', status: 'Pending' },
          { key: 'tax', name: 'Tax Clearance / SARS PIN', status: 'Pending' },
          { key: 'bee', name: 'B-BBEE Certificate', status: 'Pending' },
          { key: 'insurance', name: 'Public Liability Insurance', status: 'Pending' },
          { key: 'cipc', name: 'CIPC / Company Registration', status: 'Pending' },
          { key: 'bank', name: 'Bank Confirmation Letter', status: 'Pending' },
          { key: 'id', name: 'Director ID Documents', status: 'Pending' },
          { key: 'certifications', name: 'Other Industry Certifications', status: 'Pending' },
        ];
      }
      return JSON.parse(raw) as SupplierRow['documents'];
    } catch {
      return [
        { key: 'psira', name: 'PSiRA Registration', status: 'Pending' },
        { key: 'tax', name: 'Tax Clearance / SARS PIN', status: 'Pending' },
        { key: 'bee', name: 'B-BBEE Certificate', status: 'Pending' },
        { key: 'insurance', name: 'Public Liability Insurance', status: 'Pending' },
        { key: 'cipc', name: 'CIPC / Company Registration', status: 'Pending' },
        { key: 'bank', name: 'Bank Confirmation Letter', status: 'Pending' },
        { key: 'id', name: 'Director ID Documents', status: 'Pending' },
        { key: 'certifications', name: 'Other Industry Certifications', status: 'Pending' },
      ];
    }
  }
}
