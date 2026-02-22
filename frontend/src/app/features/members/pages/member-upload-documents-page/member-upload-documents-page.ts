import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-member-upload-documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-upload-documents-page.html',
  styleUrl: './member-upload-documents-page.css',
})
export class MemberUploadDocumentsPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  businessRegistrationCertificate: File | null = null;
  businessRegistrationCertificateExpiry: string = '';
  taxClearanceCertificate: File | null = null;
  taxClearanceCertificateExpiry: string = '';
  industryComplianceCertificate: File | null = null;
  industryComplianceCertificateExpiry: string = '';
  directorIdCopy: File | null = null;
  directorIdCopyExpiry: string = '';
  proofOfAddress: File | null = null;
  proofOfAddressExpiry: string = '';

  loading = false;
  error = '';
  successMessage = '';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  onFileSelected(event: any, documentType: string) {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      switch (documentType) {
        case 'businessRegistrationCertificate':
          this.businessRegistrationCertificate = file;
          break;
        case 'taxClearanceCertificate':
          this.taxClearanceCertificate = file;
          break;
        case 'industryComplianceCertificate':
          this.industryComplianceCertificate = file;
          break;
        case 'directorIdCopy':
          this.directorIdCopy = file;
          break;
        case 'proofOfAddress':
          this.proofOfAddress = file;
          break;
      }
      this.error = '';
    } else {
      this.error = 'Only PDF files are allowed.';
      // Clear the file input if an invalid file type is selected
      event.target.value = '';
      switch (documentType) {
        case 'businessRegistrationCertificate':
          this.businessRegistrationCertificate = null;
          break;
        case 'taxClearanceCertificate':
          this.taxClearanceCertificate = null;
          break;
        case 'industryComplianceCertificate':
          this.industryComplianceCertificate = null;
          break;
        case 'directorIdCopy':
          this.directorIdCopy = null;
          break;
        case 'proofOfAddress':
          this.proofOfAddress = null;
          break;
      }
    }
  }

  async submitForReview() {
    this.error = '';
    this.successMessage = '';

    // Basic validation to ensure all required documents are uploaded
    if (
      !this.businessRegistrationCertificate ||
      !this.taxClearanceCertificate ||
      !this.industryComplianceCertificate ||
      !this.directorIdCopy ||
      !this.proofOfAddress
    ) {
      this.error = 'Please upload all required documents.';
      return;
    }

    // Basic validation for expiry dates
    if (
      !this.businessRegistrationCertificateExpiry ||
      !this.taxClearanceCertificateExpiry ||
      !this.industryComplianceCertificateExpiry ||
      !this.directorIdCopyExpiry ||
      !this.proofOfAddressExpiry
    ) {
      this.error = 'Please enter expiry dates for all documents.';
      return;
    }

    this.loading = true;
    try {
      const currentUser = this.auth.currentUser$.value;
      if (currentUser) {
        const now = new Date().toISOString();
        const docs = [
          {
            key: 'businessRegistrationCertificate',
            name: 'Business Registration Certificate',
            status: 'Uploaded',
            expiry: this.businessRegistrationCertificateExpiry,
            uploadedAt: now,
          },
          {
            key: 'taxClearanceCertificate',
            name: 'Tax Clearance Certificate',
            status: 'Uploaded',
            expiry: this.taxClearanceCertificateExpiry,
            uploadedAt: now,
          },
          {
            key: 'industryComplianceCertificate',
            name: 'Industry Compliance Certificate',
            status: 'Uploaded',
            expiry: this.industryComplianceCertificateExpiry,
            uploadedAt: now,
          },
          {
            key: 'directorIdCopy',
            name: 'Director ID copy',
            status: 'Uploaded',
            expiry: this.directorIdCopyExpiry,
            uploadedAt: now,
          },
          {
            key: 'proofOfAddress',
            name: 'Proof of Address',
            status: 'Uploaded',
            expiry: this.proofOfAddressExpiry,
            uploadedAt: now,
          },
        ];
        const storageKey = `tapsosa.memberCompliance.${currentUser.id}`;
        localStorage.setItem(storageKey, JSON.stringify(docs));
        this.auth.updateCurrentUser({ status: 'Under Review' });
        this.router.navigateByUrl('/member/verification-pending');
      } else {
        this.error = 'User not logged in.';
      }
    } catch (e: any) {
      this.error = e?.message || 'Document submission failed.';
    } finally {
      this.loading = false;
    }
  }
}
