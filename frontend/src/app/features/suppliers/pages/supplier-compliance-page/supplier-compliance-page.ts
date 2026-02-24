import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../shared/services/auth.service';
import { DocStorageService } from '../../../../shared/services/doc-storage.service';

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
  fileUrl?: string;
  fileRefId?: string;
};

@Component({
  selector: 'app-supplier-compliance-page',
  imports: [CommonModule],
  templateUrl: './supplier-compliance-page.html',
  styleUrl: './supplier-compliance-page.css',
})
export class SupplierCompliancePage {
  private auth = inject(AuthService);
  private docStore = inject(DocStorageService);

  user: User | null = null;
  docs: ComplianceDoc[] = [];
  status = 'Pending';
  rejectionReason = '';
  
  openDoc(doc: ComplianceDoc) {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
      return;
    }
    if (doc.fileRefId) {
      this.docStore.open(doc.fileRefId);
    }
  }

  constructor(...args: unknown[]);

  constructor() {
    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      this.docs = this.loadDocs(u?.id);
      this.status = u?.status || 'Pending';
      this.rejectionReason = u?.statusReason || '';
    });
  }

  async onFileSelected(key: ComplianceKey, event: Event) {
    if (!this.user) return;
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const now = new Date().toISOString();
    const refId = await this.docStore.save(file.name, file);
    this.docs = this.docs.map((d) =>
      d.key === key
        ? { ...d, status: 'Uploaded', fileName: file.name, uploadedAt: now, fileRefId: refId }
        : d
    );
    this.saveDocs(this.user!.id, this.docs);
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
    // Remove old large entry (if any) before writing new, smaller metadata to avoid quota spikes
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(docs));
  }
}
