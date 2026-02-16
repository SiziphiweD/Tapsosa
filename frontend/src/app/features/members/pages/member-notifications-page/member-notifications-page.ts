import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockApiService, Activity } from '../../../../shared/services/mock-api.service';
import { UserPrefsService } from '../../../../shared/services/user-prefs.service';

@Component({
  selector: 'app-member-notifications-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './member-notifications-page.html',
  styleUrl: './member-notifications-page.css',
})
export class MemberNotificationsPage {
  items: Array<{ id: string; title: string; when: string; read: boolean }> = [];

  constructor(private api: MockApiService, private prefs: UserPrefsService) {
    this.api.listActivities().subscribe((acts: Activity[]) => {
      this.items = acts.map((a) => ({
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
        read: this.prefs.isRead(a.id),
      }));
    });
  }

  markAllRead() {
    this.prefs.markAllRead(this.items.map((i) => i.id));
    this.items = this.items.map((i) => ({ ...i, read: true }));
  }
}
