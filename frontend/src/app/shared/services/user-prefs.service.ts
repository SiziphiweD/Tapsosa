import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationPrefs {
  channels: { email: boolean; sms: boolean; push: boolean };
  types: {
    bids: boolean;
    bidStatus: boolean;
    milestones: boolean;
    payments: boolean;
    messages: boolean;
    system: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class UserPrefsService {
  private readonly prefsKey = 'tapsosa.prefs.notifications';
  private readonly readKey = 'tapsosa.notifications.read';
  private prefsSubject = new BehaviorSubject<NotificationPrefs>(this.loadPrefs());
  prefs$ = this.prefsSubject.asObservable();

  get prefs(): NotificationPrefs {
    return this.prefsSubject.value;
  }

  savePrefs(p: NotificationPrefs) {
    localStorage.setItem(this.prefsKey, JSON.stringify(p));
    this.prefsSubject.next(p);
  }

  isRead(id: string) {
    const set = this.loadReadSet();
    return set.has(id);
    }

  markRead(id: string) {
    const set = this.loadReadSet();
    set.add(id);
    this.saveReadSet(set);
  }

  markAllRead(ids: string[]) {
    const set = this.loadReadSet();
    ids.forEach((i) => set.add(i));
    this.saveReadSet(set);
  }

  private loadPrefs(): NotificationPrefs {
    const raw = localStorage.getItem(this.prefsKey);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return {
      channels: { email: true, sms: false, push: false },
      types: { bids: true, bidStatus: true, milestones: true, payments: true, messages: true, system: true },
    };
  }

  private loadReadSet(): Set<string> {
    const raw = localStorage.getItem(this.readKey);
    if (raw) {
      try {
        const arr: string[] = JSON.parse(raw);
        return new Set(arr);
      } catch {}
    }
    return new Set();
  }

  private saveReadSet(set: Set<string>) {
    localStorage.setItem(this.readKey, JSON.stringify(Array.from(set)));
  }
}
