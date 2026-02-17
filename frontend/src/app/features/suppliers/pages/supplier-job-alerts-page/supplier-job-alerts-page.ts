import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Alerts = {
  channels: { email: boolean; sms: boolean };
  categories: Record<string, boolean>;
};

@Component({
  selector: 'app-supplier-job-alerts-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-job-alerts-page.html',
  styleUrl: './supplier-job-alerts-page.css',
})
export class SupplierJobAlertsPage {
  model: Alerts = {
    channels: { email: true, sms: false },
    categories: {
      'Uniforms & PPE': true,
      'SIM Cards & Connectivity': true,
      'Access Control Systems': true,
      'Patrol Monitoring Systems': true,
      'Two-Way Radios': true,
      'Financial Assistance & Asset Finance': false,
      'Insurance Solutions': false,
    },
  };
  saved = false;

  constructor() {
    const raw = localStorage.getItem('tapsosa.job-alerts');
    if (raw) {
      try { this.model = JSON.parse(raw); } catch {}
    }
  }

  save() {
    localStorage.setItem('tapsosa.job-alerts', JSON.stringify(this.model));
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }
}
