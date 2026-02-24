import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'member' | 'supplier' | 'admin';
export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  company?: string;
  passwordHash: string;
  createdAt: string;
  status?: string;
  statusReason?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private users$ = new BehaviorSubject<User[]>(this.loadUsers());
  currentUser$ = new BehaviorSubject<User | null>(this.loadCurrentUser());

  constructor() {
    const users = this.users$.value;
    const hasAdmin = users.some((u) => u.role === 'admin');
    if (!hasAdmin) {
      const admin: User = {
        id: 'admin',
        role: 'admin',
        email: 'admin@ukhuselo.local',
        name: 'UKHUSELO SUPPLIER PORTAL Admin',
        passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        createdAt: new Date().toISOString(),
      };
      const updated = [admin, ...users];
      this.users$.next(updated);
      this.saveUsers(updated);
    }
  }

  async registerMember(name: string, email: string, password: string) {
    await this.ensureEmailUnique(email);
    const hash = await this.hashPassword(password);
    const user: User = {
      id: String(Date.now()),
      role: 'member',
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    const users = [user, ...this.users$.value];
    this.users$.next(users);
    this.saveUsers(users);
    this.currentUser$.next(user);
    this.saveCurrentUser(user);
    return user;
  }

  async registerSupplier(company: string, email: string, password: string, name?: string) {
    await this.ensureEmailUnique(email);
    const hash = await this.hashPassword(password);
    const user: User = {
      id: String(Date.now()),
      role: 'supplier',
      email: email.trim().toLowerCase(),
      name: name?.trim() || company.trim(),
      company: company.trim(),
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    const users = [user, ...this.users$.value];
    this.users$.next(users);
    this.saveUsers(users);
    return user;
  }

  async signIn(email: string, password: string) {
    const hash = await this.hashPassword(password);
    const latest = this.loadUsers();
    this.users$.next(latest);
    const found = latest.find(
      (u) => u.email === email.trim().toLowerCase() && u.passwordHash === hash
    );
    if (!found) {
      throw new Error('Invalid email or password');
    }
    this.currentUser$.next(found);
    this.saveCurrentUser(found);
    return found;
  }

  logout() {
    this.currentUser$.next(null);
    localStorage.removeItem('tapsosa.currentUser');
  }

  updateCurrentUser(patch: Partial<User>) {
    const current = this.currentUser$.value;
    if (!current) return;
    const updated: User = { ...current, ...patch };
    const users = this.users$.value.map((u) => (u.id === updated.id ? updated : u));
    this.users$.next(users);
    this.saveUsers(users);
    this.currentUser$.next(updated);
    this.saveCurrentUser(updated);
  }

  private async ensureEmailUnique(email: string) {
    const exists = this.users$.value.some((u) => u.email === email.trim().toLowerCase());
    if (exists) throw new Error('Email already registered');
  }

  private async hashPassword(password: string): Promise<string> {
    const enc = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private loadUsers(): User[] {
    const raw = localStorage.getItem('tapsosa.users');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  }

  private saveUsers(users: User[]) {
    localStorage.setItem('tapsosa.users', JSON.stringify(users));
  }

  private loadCurrentUser(): User | null {
    const raw = localStorage.getItem('tapsosa.currentUser');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return null;
  }

  private saveCurrentUser(user: User) {
    localStorage.setItem('tapsosa.currentUser', JSON.stringify(user));
  }

  updateUserById(id: string, patch: Partial<User>) {
    const users = this.users$.value.map((u) => (u.id === id ? { ...u, ...patch } : u));
    this.users$.next(users);
    this.saveUsers(users);
    const current = this.currentUser$.value;
    if (current && current.id === id) {
      const updated = { ...current, ...patch };
      this.currentUser$.next(updated);
      this.saveCurrentUser(updated);
    }
  }
}
