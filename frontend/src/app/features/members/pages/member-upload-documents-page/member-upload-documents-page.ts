import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { DocStorageService } from '../../../../shared/services/doc-storage.service';

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
  private docStore = inject(DocStorageService);

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
  submitted = false;  // Added missing property

  // Get today's date in YYYY-MM-DD format for min date validation
  get today(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  // Check if all required documents are uploaded
  areAllUploaded(): boolean {
    return !!(
      this.businessRegistrationCertificate &&
      this.taxClearanceCertificate &&
      this.industryComplianceCertificate &&
      this.directorIdCopy &&
      this.proofOfAddress
    );
  }

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
      this.error = 'Only PDF files are allowed. Please select a valid PDF document.';
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

    // Validate all documents are uploaded
    if (!this.areAllUploaded()) {
      this.error = 'Please upload all required documents before submitting.';
      return;
    }

    // Validate expiry dates
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

    // Validate expiry dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkExpiry = (dateStr: string): boolean => {
      const expiry = new Date(dateStr);
      expiry.setHours(0, 0, 0, 0);
      return expiry >= today;
    };

    if (
      !checkExpiry(this.businessRegistrationCertificateExpiry) ||
      !checkExpiry(this.taxClearanceCertificateExpiry) ||
      !checkExpiry(this.industryComplianceCertificateExpiry) ||
      !checkExpiry(this.directorIdCopyExpiry) ||
      !checkExpiry(this.proofOfAddressExpiry)
    ) {
      this.error = 'Expiry dates must be today or in the future.';
      return;
    }

    this.loading = true;
    this.submitted = false; // Reset submitted state
    
    try {
      const currentUser = this.auth.currentUser$.value;
      if (!currentUser) {
        this.error = 'You must be logged in to submit documents.';
        this.loading = false;
        return;
      }

      const now = new Date().toISOString();
      
      const [
        brcRef,
        taxRef,
        industryRef,
        idRef,
        addressRef,
      ] = await Promise.all([
        this.docStore.save(this.businessRegistrationCertificate!.name, this.businessRegistrationCertificate!),
        this.docStore.save(this.taxClearanceCertificate!.name, this.taxClearanceCertificate!),
        this.docStore.save(this.industryComplianceCertificate!.name, this.industryComplianceCertificate!),
        this.docStore.save(this.directorIdCopy!.name, this.directorIdCopy!),
        this.docStore.save(this.proofOfAddress!.name, this.proofOfAddress!),
      ]);

      const docs = [
        {
          key: 'businessRegistrationCertificate',
          name: 'Business Registration Certificate',
          status: 'Uploaded',
          expiry: this.businessRegistrationCertificateExpiry,
          uploadedAt: now,
          fileName: this.businessRegistrationCertificate!.name,
          fileRefId: brcRef,
        },
        {
          key: 'taxClearanceCertificate',
          name: 'Tax Clearance Certificate',
          status: 'Uploaded',
          expiry: this.taxClearanceCertificateExpiry,
          uploadedAt: now,
          fileName: this.taxClearanceCertificate!.name,
          fileRefId: taxRef,
        },
        {
          key: 'industryComplianceCertificate',
          name: 'Industry Compliance Certificate',
          status: 'Uploaded',
          expiry: this.industryComplianceCertificateExpiry,
          uploadedAt: now,
          fileName: this.industryComplianceCertificate!.name,
          fileRefId: industryRef,
        },
        {
          key: 'directorIdCopy',
          name: 'Director ID copy',
          status: 'Uploaded',
          expiry: this.directorIdCopyExpiry,
          uploadedAt: now,
          fileName: this.directorIdCopy!.name,
          fileRefId: idRef,
        },
        {
          key: 'proofOfAddress',
          name: 'Proof of Address',
          status: 'Uploaded',
          expiry: this.proofOfAddressExpiry,
          uploadedAt: now,
          fileName: this.proofOfAddress!.name,
          fileRefId: addressRef,
        },
      ];

      const storageKey = `tapsosa.memberCompliance.${currentUser.id}`;
      localStorage.removeItem(storageKey);
      localStorage.setItem(storageKey, JSON.stringify(docs));
      
      this.auth.updateCurrentUser({ status: 'Under Review' });
      
      this.successMessage = 'Documents submitted successfully! Redirecting...';
      this.submitted = true; // Set submitted to true after successful submission
      
      setTimeout(() => {
        this.router.navigateByUrl('/member/verification-pending');
      }, 2000);
      
    } catch (e: any) {
      this.error = e?.message || 'Document submission failed. Please try again.';
      this.submitted = false;
    } finally {
      this.loading = false;
    }
  }
}