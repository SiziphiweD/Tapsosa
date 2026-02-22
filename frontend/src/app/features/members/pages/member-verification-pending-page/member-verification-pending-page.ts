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

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const current = this.auth.currentUser$.value as User | null;
    if (current) {
      this.status = current.status || 'Pending';
      this.rejectionReason = current.statusReason || '';
    }
    this.documentsUploaded = [
      'Business Registration Certificate',
      'Tax Clearance Certificate',
      'Industry Compliance Certificate',
      'Director ID copy',
      'Proof of Address',
    ];
  }
}
