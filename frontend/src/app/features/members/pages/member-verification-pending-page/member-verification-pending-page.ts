import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-member-verification-pending-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './member-verification-pending-page.html',
  styleUrl: './member-verification-pending-page.css',
})
export class MemberVerificationPendingPage {
  private auth = inject(AuthService);

  documentsUploaded: string[] = [];
  rejectionReason = '';
  status = 'Pending';
  userName = '';

  constructor() {
    const current = this.auth.currentUser$.value as User | null;
    
    if (current) {
      this.status = current.status || 'Pending';
      this.rejectionReason = current.statusReason || '';
      this.userName = current.name || 'User';
    }
    
    // Load uploaded documents from compliance storage
    this.loadUploadedDocuments(current?.id);
  }

  private loadUploadedDocuments(userId?: string) {
    if (!userId) {
      // Fallback to default list
      this.documentsUploaded = [
        'Business Registration Certificate',
        'Tax Clearance Certificate',
        'Industry Compliance Certificate',
        'Director ID copy',
        'Proof of Address',
      ];
      return;
    }

    try {
      const storageKey = `tapsosa.memberCompliance.${userId}`;
      const raw = localStorage.getItem(storageKey);
      
      if (raw) {
        const docs = JSON.parse(raw);
        if (Array.isArray(docs) && docs.length > 0) {
          // Extract document names from stored data
          this.documentsUploaded = docs.map((doc: any) => doc.name || 'Document');
        } else {
          this.documentsUploaded = [
            'Business Registration Certificate',
            'Tax Clearance Certificate',
            'Industry Compliance Certificate',
            'Director ID copy',
            'Proof of Address',
          ];
        }
      } else {
        this.documentsUploaded = [
          'Business Registration Certificate',
          'Tax Clearance Certificate',
          'Industry Compliance Certificate',
          'Director ID copy',
          'Proof of Address',
        ];
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      this.documentsUploaded = [
        'Business Registration Certificate',
        'Tax Clearance Certificate',
        'Industry Compliance Certificate',
        'Director ID copy',
        'Proof of Address',
      ];
    }
  }

  // Helper to get status icon
  getStatusIcon(): string {
    switch (this.status.toLowerCase()) {
      case 'approved':
        return 'bi-check-circle-fill';
      case 'rejected':
        return 'bi-exclamation-triangle-fill';
      default:
        return 'bi-hourglass-split';
    }
  }

  // Helper to get status color class
  getStatusClass(): string {
    switch (this.status.toLowerCase()) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  }
}