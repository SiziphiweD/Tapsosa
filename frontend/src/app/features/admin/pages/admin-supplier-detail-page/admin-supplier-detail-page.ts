import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocStorageService } from '../../../../shared/services/doc-storage.service';

type Supplier = {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
  status?: string;
  statusReason?: string;
};

type Doc = { key: string; name: string; status: string; fileName?: string; uploadedAt?: string };
type DocWithUrl = Doc & { fileUrl?: string; fileRefId?: string };

@Component({
  selector: 'app-admin-supplier-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-supplier-detail-page.html',
  styleUrl: './admin-supplier-detail-page.css',
})
export class AdminSupplierDetailPage {
  private route = inject(ActivatedRoute);
  private docStore = inject(DocStorageService);

  supplierId = '';
  supplier: Supplier | null = null;
  documents: DocWithUrl[] = [];

  constructor() {
    this.supplierId = this.route.snapshot.paramMap.get('supplierId') || '';
    this.supplier = this.loadSupplier(this.supplierId);
    this.documents = this.loadDocs(this.supplierId);
  }

  async openDoc(d: DocWithUrl) {
    if ((d as any).fileUrl) {
      window.open((d as any).fileUrl, '_blank');
      return;
    }
    if ((d as any).fileRefId) {
      await this.docStore.open((d as any).fileRefId);
      return;
    }
  }

  private loadSupplier(id: string): Supplier | null {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const u = users.find((x) => x.id === id && x.role === 'supplier');
      if (!u) return null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        company: u.company,
        createdAt: u.createdAt,
        status: u.status || 'Pending',
        statusReason: u.statusReason,
      };
    } catch {
      return null;
    }
  }

  private loadDocs(userId: string): DocWithUrl[] {
    const key = `tapsosa.compliance.${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as DocWithUrl[];
    } catch {}
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

  statusClass(s?: string) {
    const v = (s || 'Pending').toLowerCase();
    if (v === 'approved') return 'approved';
    if (v === 'rejected') return 'rejected';
    return 'pending';
  }
}
