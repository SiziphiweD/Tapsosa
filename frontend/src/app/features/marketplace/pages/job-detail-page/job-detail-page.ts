import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Job, Bid } from '../../../../shared/services/mock-api.service';
import { AuthService, User } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-job-detail-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './job-detail-page.html',
  styleUrl: './job-detail-page.css',
})
export class JobDetailPage {
  private route = inject(ActivatedRoute);
  private api = inject(MockApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  job: Job | undefined;
  jobLoadFailed = false;
  bids: Bid[] = [];
  winningBid: Bid | undefined;
  saved = false;

  user: User | null = null;

  supplierName = '';
  price: number | null = null;
  days: number | null = null;
  message = '';
  approach = '';
  timeline = '';
  team = '';
  risks = '';
  pricingBreakdown = '';
  termsAccepted = false;
  validityDays: number | null = null;
  submitted = false;
  startDate: string | null = null;
  paymentStructure = '';
  experience = '';
  guarantees = '';
  uploadedFileNames: string[] = [];

  constructor() {
    const id = this.route.snapshot.paramMap.get('jobId')!;
    if (!id) {
      this.jobLoadFailed = true;
      return;
    }

    const focus = this.route.snapshot.queryParamMap.get('focus');
    
    this.api.getJob(id).subscribe((j) => {
      this.job = j;
      if (!j) {
        this.jobLoadFailed = true;
        this.cdr.detectChanges();
        return;
      }
      this.winningBid = j?.chosenBidId ? this.bids.find((b) => b.id === j.chosenBidId) : undefined;
      this.saved = this.isSaved(j.id);
      
      if (focus === 'bid') {
        setTimeout(() => {
          const el = document.getElementById('bid');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      }
      this.cdr.detectChanges();
    });

    this.api.listBids(id).subscribe((b) => {
      this.bids = b;
      this.winningBid = this.job?.chosenBidId ? b.find((x) => x.id === this.job!.chosenBidId) : undefined;
      this.cdr.detectChanges();
    });

    this.auth.currentUser$.subscribe((u) => {
      this.user = u;
      if (u && u.role === 'supplier' && this.supplierName.trim() === '') {
        this.supplierName = u.company || u.name;
      }
      this.cdr.detectChanges();
    });

    setTimeout(() => {
      if (!this.job) this.jobLoadFailed = true;
      this.cdr.detectChanges();
    }, 1500);
  }

  get minBidDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  get isValid() {
    return (
      this.supplierName.trim().length > 0 &&
      !!this.price &&
      !!this.days &&
      this.price! > 0 &&
      this.days! > 0 &&
      this.startDate !== null &&
      this.startDate.length > 0 &&
      this.message.trim().length > 0 &&
      this.message.trim().length <= 200 &&
      this.approach.trim().length > 0 &&
      this.timeline.trim().length > 0 &&
      this.team.trim().length > 0 &&
      this.paymentStructure.trim().length > 0 &&
      !!this.validityDays &&
      this.validityDays! > 0 &&
      this.termsAccepted === true
    );
  }

  get canBid() {
    return this.bidStatusMessage === null;
  }

  get bidStatusMessage(): string | null {
    if (!this.job) return 'Job not found';
    if (!this.user) return 'Sign in as a supplier to submit a bid.';
    if (this.user.role !== 'supplier') return 'You must be signed in as a supplier to submit bids.';
    
    const status = (this.user.status || 'Pending').toLowerCase();
    if (status !== 'approved') {
      return 'Your supplier account is pending approval. You may review opportunities but cannot submit bids yet.';
    }
    
    if (this.job.escrow) return 'This job has already been awarded and is in escrow.';
    if (this.daysLeft(this.job.bidDeadline) <= 0) return 'Bidding deadline has passed.';
    
    return null;
  }

  submitBid() {
    if (!this.job || !this.isValid || !this.canBid) return;
    
    const supplierId = this.user?.id || 'unknown';
    
    this.api
      .createBid({
        jobId: this.job.id,
        supplierId,
        supplierName: this.supplierName,
        price: this.price as number,
        days: this.days as number,
        message: this.message,
      })
      .subscribe(() => {
        this.submitted = true;
        
        // Reset form
        this.supplierName = this.user?.company || this.user?.name || '';
        this.price = null;
        this.days = null;
        this.message = '';
        this.approach = '';
        this.timeline = '';
        this.team = '';
        this.risks = '';
        this.pricingBreakdown = '';
        this.termsAccepted = false;
        this.validityDays = null;
        this.startDate = null;
        this.paymentStructure = '';
        this.experience = '';
        this.guarantees = '';
        this.uploadedFileNames = [];
        
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.submitted = false;
          this.cdr.detectChanges();
        }, 3000);
      });
  }

  saveDraft() {
    if (!this.job) return;
    
    const key = 'tapsosa.draft-bids';
    const raw = localStorage.getItem(key);
    let arr: any[] = [];
    if (raw) {
      try { arr = JSON.parse(raw); } catch {}
    }
    
    const draft = {
      id: 'draft-' + Date.now(),
      jobId: this.job.id,
      jobTitle: this.job.title,
      supplierName: this.supplierName,
      price: this.price,
      days: this.days,
      message: this.message,
      approach: this.approach,
      timeline: this.timeline,
      team: this.team,
      risks: this.risks,
      pricingBreakdown: this.pricingBreakdown,
      termsAccepted: this.termsAccepted,
      validityDays: this.validityDays,
      startDate: this.startDate,
      paymentStructure: this.paymentStructure,
      experience: this.experience,
      guarantees: this.guarantees,
      files: this.uploadedFileNames,
      createdAt: new Date().toISOString(),
    };
    
    arr.unshift(draft);
    localStorage.setItem(key, JSON.stringify(arr));
    
    // Show a quick notification
    alert('Draft saved successfully!');
  }

  toggleSave() {
    if (!this.job) return;
    
    const key = 'tapsosa.saved.jobs';
    const raw = localStorage.getItem(key);
    let arr: string[] = [];
    if (raw) {
      try { arr = JSON.parse(raw); } catch {}
    }
    
    const idx = arr.indexOf(this.job.id);
    if (idx >= 0) {
      arr.splice(idx, 1);
      this.saved = false;
    } else {
      arr.unshift(this.job.id);
      arr = Array.from(new Set(arr));
      this.saved = true;
    }
    
    localStorage.setItem(key, JSON.stringify(arr));
  }

  daysLeft(dateStr: string | undefined) {
    if (!dateStr) return 0;
    const today = new Date();
    const d = new Date(dateStr);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  }

  onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.uploadedFileNames = files.map((f) => f.name);
  }

  private isSaved(id: string) {
    const raw = localStorage.getItem('tapsosa.saved.jobs');
    if (!raw) return false;
    try { 
      const arr: string[] = JSON.parse(raw); 
      return arr.includes(id); 
    } catch { 
      return false; 
    }
  }
}