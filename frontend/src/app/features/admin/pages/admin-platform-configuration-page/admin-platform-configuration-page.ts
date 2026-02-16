import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type General = { platformName: string; branding: string; contactEmail: string; contactPhone: string; businessHours: string; maintenance: boolean };
type Payment = { gateway: string; publicKey: string; secretKey: string; testMode: boolean; txLimit: number };
type EmailTemplate = { subject: string; body: string };
type EmailTemplates = { welcome: EmailTemplate; notification: EmailTemplate; transaction: EmailTemplate };
type Sms = { gateway: string; apiKey: string; templates: { default: string; otp: string } };
type Flags = { enableFeatures: boolean; betaFeatures: boolean; abTesting: boolean };

@Component({
  selector: 'app-admin-platform-configuration-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-platform-configuration-page.html',
  styleUrl: './admin-platform-configuration-page.css',
})
export class AdminPlatformConfigurationPage {
  general: General = { platformName: 'TAPSOSA', branding: 'Supplier Portal', contactEmail: '', contactPhone: '', businessHours: 'Mon-Fri 9:00-17:00', maintenance: false };
  payment: Payment = { gateway: 'DemoGateway', publicKey: '', secretKey: '', testMode: true, txLimit: 50000 };
  email: EmailTemplates = { welcome: { subject: 'Welcome', body: 'Welcome to TAPSOSA' }, notification: { subject: 'Notification', body: 'You have a new update' }, transaction: { subject: 'Transaction', body: 'Your transaction details' } };
  sms: Sms = { gateway: 'DemoSMS', apiKey: '', templates: { default: 'Hello', otp: 'Your code is {{code}}' } };
  flags: Flags = { enableFeatures: true, betaFeatures: false, abTesting: false };
  saved = false;

  constructor() {
    this.load();
  }

  saveGeneral() {
    localStorage.setItem('tapsosa.config.general', JSON.stringify(this.general));
    this.toast();
    this.log('Saved General Settings');
  }

  savePayment() {
    localStorage.setItem('tapsosa.config.payment', JSON.stringify(this.payment));
    this.toast();
    this.log('Saved Payment Settings');
  }

  saveEmail() {
    localStorage.setItem('tapsosa.config.email', JSON.stringify(this.email));
    this.toast();
    this.log('Saved Email Templates');
  }

  saveSms() {
    localStorage.setItem('tapsosa.config.sms', JSON.stringify(this.sms));
    this.toast();
    this.log('Saved SMS Settings');
  }

  saveFlags() {
    localStorage.setItem('tapsosa.config.flags', JSON.stringify(this.flags));
    this.toast();
    this.log('Saved Feature Flags');
  }

  private load() {
    try {
      const g = localStorage.getItem('tapsosa.config.general');
      const p = localStorage.getItem('tapsosa.config.payment');
      const e = localStorage.getItem('tapsosa.config.email');
      const s = localStorage.getItem('tapsosa.config.sms');
      const f = localStorage.getItem('tapsosa.config.flags');
      if (g) this.general = JSON.parse(g);
      if (p) this.payment = JSON.parse(p);
      if (e) this.email = JSON.parse(e);
      if (s) this.sms = JSON.parse(s);
      if (f) this.flags = JSON.parse(f);
    } catch {}
  }

  private toast() {
    this.saved = true;
    setTimeout(() => (this.saved = false), 1500);
  }

  private log(action: string) {
    try {
      const raw = localStorage.getItem('tapsosa.admin.logs');
      const logs = raw ? JSON.parse(raw) : [];
      logs.unshift({ id: 'log-' + Date.now(), action, page: 'Platform Configuration', timestamp: new Date().toISOString() });
      localStorage.setItem('tapsosa.admin.logs', JSON.stringify(logs.slice(0, 200)));
    } catch {}
  }
}
