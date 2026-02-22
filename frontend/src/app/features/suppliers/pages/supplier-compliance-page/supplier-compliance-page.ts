import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../shared/services/auth.service';

type ComplianceKey =
  | 'psira'
  | 'tax'
  | 'bee'
  | 'insurance'
  | 'cipc'
  | 'bank'
  | 'id'
  | 'certifications';

type ComplianceStatus = 'Pending' | 'Uploaded';

type ComplianceDoc = {
  key: ComplianceKey;
  name: string;
  status: ComplianceStatus;
  fileName?: string;
  uploadedAt?: string;
};

@Component({
  selector: 'app-supplier-compliance-page',
  imports: [CommonModule],
  templateUrl: './supplier-compliance-page.html',
  styleUrl: './supplier-compliance-page.css',
})
export class SupplierCompliancePage {
  private auth = inject(AuthService);

  user: User | null = null;
  docs: ComplianceDoc[] = [];

  constructor(...args: unknown[]);

  constructor() {
    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      this.docs = this.loadDocs(u?.id);
    });
  }

  onFileSelected(key: ComplianceKey, event: Event) {
    if (!this.user) return;
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const now = new Date().toISOString();
    this.docs = this.docs.map((d) =>
      d.key === key
        ? { ...d, status: 'Uploaded', fileName: file.name, uploadedAt: now }
        : d
    );
    this.saveDocs(this.user.id, this.docs);
    input.value = '';
  }

  private baseDocs(): ComplianceDoc[] {
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

  private loadDocs(userId: string | undefined): ComplianceDoc[] {
    const base = this.baseDocs();
    if (!userId) return base;
    const key = `tapsosa.compliance.${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return base;
    try {
      const saved = JSON.parse(raw) as ComplianceDoc[];
      return base.map((d) => saved.find((s) => s.key === d.key) || d);
    } catch {
      return base;
    }
  }

  private saveDocs(userId: string, docs: ComplianceDoc[]) {
    const key = `tapsosa.compliance.${userId}`;
    localStorage.setItem(key, JSON.stringify(docs));
  }
}
