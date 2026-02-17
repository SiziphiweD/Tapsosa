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
    return [
      { id: 'absa', bank: 'Absa Bank', holder: 'Primary Trading Account', number: '1234567890', isDefault: true },
      { id: 'fnb', bank: 'First National Bank (FNB)', holder: 'Primary Trading Account', number: '62012345678' },
      { id: 'standard', bank: 'Standard Bank', holder: 'Primary Trading Account', number: '000123456789' },
      { id: 'nedbank', bank: 'Nedbank', holder: 'Primary Trading Account', number: '19876543210' },
      { id: 'capitec', bank: 'Capitec Bank', holder: 'Primary Trading Account', number: '47001234567' },
      { id: 'investec', bank: 'Investec Bank', holder: 'Primary Trading Account', number: '77700012345' },
    ];
  }
}
