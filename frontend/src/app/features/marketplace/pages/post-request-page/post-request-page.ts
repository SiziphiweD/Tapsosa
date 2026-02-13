import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockApiService } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-post-request-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './post-request-page.html',
  styleUrl: './post-request-page.css',
})
export class PostRequestPage {

  title = '';
  category = 'Guarding Services';
  location = '';
  minBudget: number | null = null;
  maxBudget: number | null = null;
  bidDeadline = '';
  startDate = '';
  endDate = '';
  durationDays: number | null = null;
  attachments: File[] = [];
  submitted = false;

  constructor(private api: MockApiService) {}

  get isValid() {
    const required =
      this.title.trim().length > 0 &&
      this.location.trim().length > 0 &&
      !!this.minBudget &&
      !!this.maxBudget &&
      !!this.bidDeadline;
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
    return required && budgetOk && datesOk;
  }

  get datesInvalid() {
    if (!this.startDate || !this.endDate) return false;
    return new Date(this.startDate).getTime() > new Date(this.endDate).getTime();
  }

  onFilesSelected(files: FileList | null) {
    if (!files) return;
    this.attachments = Array.from(files);
  }

  publish() {
    if (!this.isValid) return;
    this.api
      .createJob({
        title: this.title,
        category: this.category,
        location: this.location,
        minBudget: this.minBudget as number,
        maxBudget: this.maxBudget as number,
        bidDeadline: this.bidDeadline,
        startDate: this.startDate || undefined,
        endDate: this.endDate || undefined,
        durationDays: this.durationDays,
      })
      .subscribe(() => {
        this.submitted = true;
        this.title = '';
        this.category = 'Guarding Services';
        this.location = '';
        this.minBudget = null;
        this.maxBudget = null;
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
