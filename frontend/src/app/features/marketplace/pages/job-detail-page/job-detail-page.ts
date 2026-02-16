import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockApiService, Job, Bid } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-job-detail-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './job-detail-page.html',
  styleUrl: './job-detail-page.css',
})
export class JobDetailPage {
  job: Job | undefined;
  bids: Bid[] = [];
  winningBid: Bid | undefined;
  saved = false;

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

  constructor(private route: ActivatedRoute, private api: MockApiService) {
    const id = route.snapshot.paramMap.get('jobId')!;
    api.getJob(id).subscribe((j) => {
      this.job = j;
      this.winningBid = j?.chosenBidId ? this.bids.find((b) => b.id === j.chosenBidId) : undefined;
      this.saved = this.isSaved(j?.id || '');
    });
    api.listBids(id).subscribe((b) => {
      this.bids = b;
      this.winningBid = this.job?.chosenBidId ? b.find((x) => x.id === this.job!.chosenBidId) : undefined;
    });
  }

  get isValid() {
    return (
      this.supplierName.trim().length > 0 &&
      !!this.price &&
      !!this.days &&
      this.price! > 0 &&
      this.days! > 0 &&
      this.message.trim().length > 0 &&
      this.termsAccepted === true
    );
  }

  submitBid() {
    if (!this.job || !this.isValid) return;
    this.api
      .createBid({
        jobId: this.job.id,
        supplierName: this.supplierName,
        price: this.price as number,
        days: this.days as number,
        message: this.message,
      })
      .subscribe(() => {
        this.submitted = true;
        this.supplierName = '';
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
        setTimeout(() => (this.submitted = false), 3000);
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
      createdAt: new Date().toISOString(),
    };
    arr.unshift(draft);
    localStorage.setItem(key, JSON.stringify(arr));
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

  private isSaved(id: string) {
    const raw = localStorage.getItem('tapsosa.saved.jobs');
    if (!raw) return false;
    try { const arr: string[] = JSON.parse(raw); return arr.includes(id); } catch { return false; }
  }
}
