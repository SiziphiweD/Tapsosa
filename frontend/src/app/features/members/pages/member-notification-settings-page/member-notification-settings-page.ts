import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPrefsService } from '../../../../shared/services/user-prefs.service';

@Component({
  selector: 'app-member-notification-settings-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-notification-settings-page.html',
  styleUrl: './member-notification-settings-page.css',
})
export class MemberNotificationSettingsPage {
  private prefs = inject(UserPrefsService);

  email = true;
  sms = false;
  push = false;
  types = {
    bids: true,
    bidStatus: true,
    milestones: true,
    payments: true,
    messages: true,
    system: true,
  };

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const p = this.prefs.prefs;
    this.email = p.channels.email;
    this.sms = p.channels.sms;
    this.push = p.channels.push;
    this.types = { ...p.types };
  }

  save() {
    this.prefs.savePrefs({
      channels: { email: this.email, sms: this.sms, push: this.push },
      types: { ...this.types },
    });
  }
}
