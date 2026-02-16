import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Job } from '../../../../shared/services/mock-api.service';

@Component({
  selector: 'app-member-jobs-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-jobs-page.html',
  styleUrl: './member-jobs-page.css',
})
export class MemberJobsPage {
  jobs: Job[] = [];
  constructor(private api: MockApiService) {
    api.listJobs().subscribe((jobs) => (this.jobs = jobs));
  }
}
