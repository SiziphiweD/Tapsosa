import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type BankAccount = { id: string; bank: string; holder: string; number: string; isDefault?: boolean };

@Component({
  selector: 'app-bank-accounts-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './bank-accounts-page.html',
  styleUrl: './bank-accounts-page.css',
})
export class BankAccountsPage {
  accounts: BankAccount[] = [];
  bank = '';
  holder = '';
  number = '';

  constructor() {
    this.accounts = this.loadAccounts();
  }

  add() {
    if (!this.bank || !this.holder || !this.number) return;
    const acc: BankAccount = { id: String(Date.now()), bank: this.bank, holder: this.holder, number: this.number, isDefault: this.accounts.length === 0 };
    this.accounts = [acc, ...this.accounts];
    this.saveAccounts();
    this.bank = this.holder = this.number = '';
  }

  setDefault(id: string) {
    this.accounts = this.accounts.map((a) => ({ ...a, isDefault: a.id === id }));
    this.saveAccounts();
  }

  remove(id: string) {
    this.accounts = this.accounts.filter((a) => a.id !== id);
    this.saveAccounts();
  }

  private loadAccounts(): BankAccount[] {
    const raw = localStorage.getItem('tapsosa.bank-accounts');
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return [];
  }
  private saveAccounts() {
    localStorage.setItem('tapsosa.bank-accounts', JSON.stringify(this.accounts));
  }
}
