import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Activity } from '../../../../shared/services/mock-api.service';
import { UserPrefsService } from '../../../../shared/services/user-prefs.service';

@Component({
  selector: 'app-member-notifications-unread-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-notifications-unread-page.html',
  styleUrl: './member-notifications-unread-page.css',
})
export class MemberNotificationsUnreadPage {
  private api = inject(MockApiService);
  private prefs = inject(UserPrefsService);

  items: Array<{ id: string; title: string; when: string }> = [];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.api.listActivities().subscribe((acts: Activity[]) => {
      this.items = acts
        .filter((a) => !this.prefs.isRead(a.id))
        .map((a) => ({
          id: a.id,
          title:
            a.type === 'bid_submitted'
              ? 'New bid received'
              : a.type === 'winner_selected'
              ? 'Bid accepted'
              : a.type === 'escrow_funded'
              ? 'Payment funded to escrow'
              : 'Payment released',
          when: new Date(a.timestamp).toLocaleString(),
        }));
    });
  }

  markAllRead() {
    this.prefs.markAllRead(this.items.map((i) => i.id));
    this.items = [];
  }
}
