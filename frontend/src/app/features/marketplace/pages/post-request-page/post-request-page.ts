import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockApiService, Attachment } from '../../../../shared/services/mock-api.service';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-post-request-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './post-request-page.html',
  styleUrl: './post-request-page.css',
})
export class PostRequestPage {
  private api = inject(MockApiService);
  private auth = inject(AuthService);
  private router = inject(Router);


  title = '';
  category = 'Uniforms & PPE';
  location = '';
  requirements = '';
  requiredCertsText = '';
  minBudget: number | null = null;
  maxBudget: number | null = null;
  quantity: number | null = null;
  bidDeadline = '';
  startDate = '';
  endDate = '';
  durationDays: number | null = null;
  attachments: Attachment[] = [];
  submitted = false;
  isApproved = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const current = this.auth.currentUser$.value as User | null;
    if (current) {
      const status = current.status || 'Pending';
      this.isApproved = status.toLowerCase() === 'approved';
    }

    if (!this.isApproved) {
      this.router.navigateByUrl('/member/verification-pending');
      return;
    }
  }

  get isValid() {
    const required =
      this.title.trim().length > 0 &&
      this.location.trim().length > 0 &&
      this.requirements.trim().length > 0 &&
      !!this.minBudget &&
      !!this.maxBudget &&
      !!this.bidDeadline &&
      this.attachments.length > 0;
    const budgetOk =
      this.minBudget !== null &&
      this.maxBudget !== null &&
      this.minBudget > 0 &&
      this.maxBudget > 0 &&
      this.minBudget <= this.maxBudget;
    const datesOk =
      (this.startDate === '' && this.endDate === '') ||
      (this.startDate !== '' &&
        this.endDate !== '' &&
        new Date(this.startDate).getTime() <= new Date(this.endDate).getTime());
    const qtyOk = this.quantity !== null && this.quantity > 0;
    const deadlineOk = !this.deadlineInPast;
    return required && budgetOk && datesOk && qtyOk && deadlineOk;
  }

  get datesInvalid() {
    if (!this.startDate || !this.endDate) return false;
    return new Date(this.startDate).getTime() > new Date(this.endDate).getTime();
  }

  get deadlineInPast() {
    if (!this.bidDeadline) return false;
    const d = new Date(this.bidDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d.getTime() <= today.getTime();
  }
 
  async onFilesSelected(files: FileList | null) {
    if (!files) return;
    const readers = Array.from(files).map((f) => this.readFileToDataUrl(f));
    const dataUrls = await Promise.all(readers);
    this.attachments = Array.from(files).map((f, i) => ({ name: f.name, size: f.size, type: f.type, dataUrl: dataUrls[i] }));
  }
 
  private readFileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  publish() {
    if (!this.isValid) return;
    const requiredCertifications =
      this.requiredCertsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0) || [];
    this.api
      .createJob({
        title: this.title,
        category: this.category,
        location: this.location,
        requirements: this.requirements || undefined,
        requiredCertifications: requiredCertifications.length ? requiredCertifications : undefined,
        minBudget: this.minBudget as number,
        maxBudget: this.maxBudget as number,
        quantity: this.quantity as number,
        attachments: this.attachments.length ? this.attachments : undefined,
        bidDeadline: this.bidDeadline,
        startDate: this.startDate || undefined,
        endDate: this.endDate || undefined,
        durationDays: this.durationDays,
      })
      .subscribe(() => {
        this.submitted = true;
        this.title = '';
        this.category = 'Uniforms & PPE';
        this.location = '';
        this.requirements = '';
        this.requiredCertsText = '';
        this.minBudget = null;
        this.maxBudget = null;
        this.quantity = null;
        this.bidDeadline = '';
        this.startDate = '';
        this.endDate = '';
        this.durationDays = null;
        this.attachments = [];
        setTimeout(() => {
          this.submitted = false;
        }, 3500);
      });
  }
}
