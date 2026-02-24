import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocStorageService } from '../../../../shared/services/doc-storage.service';

type Member = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status?: string;
  statusReason?: string;
};

type Doc = { key: string; name: string; status: string; fileName?: string; uploadedAt?: string; fileUrl?: string; fileRefId?: string };

@Component({
  selector: 'app-admin-member-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-member-detail-page.html',
  styleUrl: './admin-member-detail-page.css',
})
export class AdminMemberDetailPage {
  private route = inject(ActivatedRoute);
  private docStore = inject(DocStorageService);

  memberId = '';
  member: Member | null = null;
  documents: Doc[] = [];

  constructor() {
    this.memberId = this.route.snapshot.paramMap.get('memberId') || '';
    this.member = this.loadMember(this.memberId);
    this.documents = this.loadDocs(this.memberId);
  }

  async openDoc(d: Doc) {
    if (d.fileUrl) {
      window.open(d.fileUrl, '_blank');
      return;
    }
    if (d.fileRefId) {
      await this.docStore.open(d.fileRefId);
      return;
    }
  }

  private loadMember(id: string): Member | null {
    try {
      const raw = localStorage.getItem('tapsosa.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const u = users.find((x) => x.id === id && x.role === 'member');
      if (!u) return null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        status: u.status || 'Pending',
        statusReason: u.statusReason,
      };
    } catch {
      return null;
    }
  }

  private loadDocs(userId: string): Doc[] {
    // Member docs are stored under tapsosa.memberCompliance.<id>
    const key = `tapsosa.memberCompliance.${userId}`;
    const base: Doc[] = [
      { key: 'businessRegistrationCertificate', name: 'Business Registration Certificate', status: 'Not Uploaded' },
      { key: 'taxClearanceCertificate', name: 'Tax Clearance Certificate', status: 'Not Uploaded' },
      { key: 'industryComplianceCertificate', name: 'Industry Compliance Certificate', status: 'Not Uploaded' },
      { key: 'directorIdCopy', name: 'Director ID copy', status: 'Not Uploaded' },
      { key: 'proofOfAddress', name: 'Proof of Address', status: 'Not Uploaded' },
    ];
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return base;
      const saved = JSON.parse(raw) as Doc[];
      return base.map((d) => saved.find((s) => s.key === d.key) || d);
    } catch {
      return base;
    }
  }

  statusClass(s?: string) {
    const v = (s || 'Pending').toLowerCase();
    if (v === 'approved') return 'approved';
    if (v === 'rejected') return 'rejected';
    return 'pending';
  }
}
