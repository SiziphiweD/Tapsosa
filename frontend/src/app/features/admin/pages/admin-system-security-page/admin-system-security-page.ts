import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Backup = { id: string; name: string; createdAt: string; data: Record<string, string> };
type AdminLog = { id: string; action: string; page: string; timestamp: string };

@Component({
  selector: 'app-admin-system-security-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-system-security-page.html',
  styleUrl: './admin-system-security-page.css',
})
export class AdminSystemSecurityPage {
  serverStatus = 'OK';
  databaseStatus = 'OK';
  apiStatus = 'OK';
  errorLogs: string[] = [];

  loginAttempts = 0;
  suspicious = 0;
  blockedIps = 0;
  incidents = 0;

  backups: Backup[] = [];
  backupName = '';

  adminLogs: AdminLog[] = [];

  constructor() {
    this.loadErrors();
    this.loadBackups();
    this.loadAdminLogs();
  }

  createBackup() {
    const name = this.backupName.trim() || 'Backup ' + new Date().toLocaleString();
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('tapsosa.'));
    const data: Record<string, string> = {};
    keys.forEach((k) => (data[k] = localStorage.getItem(k) || ''));
    const b: Backup = { id: 'bk-' + Date.now(), name, createdAt: new Date().toISOString(), data };
    this.backups = [b, ...this.backups];
    localStorage.setItem('tapsosa.backups', JSON.stringify(this.backups));
    this.backupName = '';
    this.log('Created backup');
  }

  restoreBackup(id: string) {
    const b = this.backups.find((x) => x.id === id);
    if (!b) return;
    Object.entries(b.data).forEach(([k, v]) => localStorage.setItem(k, v));
    this.log('Restored backup');
  }

  deleteBackup(id: string) {
    this.backups = this.backups.filter((b) => b.id !== id);
    localStorage.setItem('tapsosa.backups', JSON.stringify(this.backups));
    this.log('Deleted backup');
  }

  private loadErrors() {
    try {
      const raw = localStorage.getItem('tapsosa.errors');
      this.errorLogs = raw ? JSON.parse(raw) : [];
    } catch {
      this.errorLogs = [];
    }
  }

  private loadBackups() {
    try {
      const raw = localStorage.getItem('tapsosa.backups');
      this.backups = raw ? JSON.parse(raw) : [];
    } catch {
      this.backups = [];
    }
  }

  private loadAdminLogs() {
    try {
      const raw = localStorage.getItem('tapsosa.admin.logs');
      this.adminLogs = raw ? JSON.parse(raw) : [];
    } catch {
      this.adminLogs = [];
    }
  }

  private log(action: string) {
    try {
      const raw = localStorage.getItem('tapsosa.admin.logs');
      const logs = raw ? JSON.parse(raw) : [];
      logs.unshift({ id: 'log-' + Date.now(), action, page: 'System & Security', timestamp: new Date().toISOString() });
      localStorage.setItem('tapsosa.admin.logs', JSON.stringify(logs.slice(0, 200)));
      this.adminLogs = logs;
    } catch {}
  }
}
