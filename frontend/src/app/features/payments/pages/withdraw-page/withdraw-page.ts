import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type BankAccount = { id: string; bank: string; holder: string; number: string; isDefault?: boolean };

@Component({
  selector: 'app-withdraw-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './withdraw-page.html',
  styleUrl: './withdraw-page.css',
})
export class WithdrawPage {
  accounts: BankAccount[] = [];
  selectedId: string | null = null;
  amount: number | null = null;
  processingFeeRate = 0;
  submitted = false;

  constructor() {
    this.accounts = this.loadAccounts();
    const def = this.accounts.find((a) => a.isDefault) || this.accounts[0];
    this.selectedId = def ? def.id : null;
  }

  get fee() {
    if (!this.amount) return 0;
    return Math.round(this.amount * this.processingFeeRate);
  }
  get total() {
    return (this.amount || 0) - this.fee;
  }

  submit() {
    if (!this.selectedId || !this.amount || this.amount <= 0) return;
    this.submitted = true;
    setTimeout(() => (this.submitted = false), 2500);
  }

  private loadAccounts(): BankAccount[] {
    const raw = localStorage.getItem('tapsosa.bank-accounts');
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return [];
  }
}
