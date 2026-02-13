import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  minBudget: number;
  maxBudget: number;
  bidDeadline: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number | null;
  verified: boolean;
  chosenBidId?: string | null;
  escrow?: Escrow | null;
}

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private jobs$ = new BehaviorSubject<Job[]>(this.loadJobs());
  private bids$ = new BehaviorSubject<Bid[]>(this.loadBids());
  private activities$ = new BehaviorSubject<Activity[]>(this.loadActivities());

  listJobs(): Observable<Job[]> {
    return this.jobs$.asObservable();
  }

  createJob(data: Omit<Job, 'id' | 'verified'>): Observable<Job> {
    const job: Job = { id: String(Date.now()), verified: true, ...data };
    const next = [job, ...this.jobs$.value];
    this.jobs$.next(next);
    this.saveJobs(next);
    return of(job).pipe(delay(400));
  }

  getJob(jobId: string): Observable<Job | undefined> {
    return of(this.jobs$.value.find((j) => j.id === jobId)).pipe(delay(200));
  }

  listBids(jobId: string): Observable<Bid[]> {
    return of(this.bids$.value.filter((b) => b.jobId === jobId)).pipe(delay(200));
  }

  createBid(data: Omit<Bid, 'id' | 'createdAt'>): Observable<Bid> {
    const bid: Bid = { id: String(Date.now()), createdAt: new Date().toISOString(), ...data };
    const next = [bid, ...this.bids$.value];
    this.bids$.next(next);
    this.saveBids(next);
    this.recordActivity({
      id: 'act-' + Date.now(),
      type: 'bid_submitted',
      jobId: bid.jobId,
      bidId: bid.id,
      amount: bid.price,
      timestamp: new Date().toISOString(),
    });
    return of(bid).pipe(delay(400));
  }

  selectWinningBid(jobId: string, bidId: string): Observable<Job | undefined> {
    const bid = this.bids$.value.find((b) => b.id === bidId);
    const feeRate = 0.07;
    const jobs: Job[] = this.jobs$.value.map((j) => {
      if (j.id !== jobId) return j;
      const fee = bid ? Math.round(bid.price * feeRate) : 0;
      const net = bid ? bid.price - fee : 0;
      const escrow: Escrow | null = bid
        ? { bidId, gross: bid.price, fee, net, status: 'pending' }
        : j.escrow ?? null;
      const updated: Job = {
        ...j,
        chosenBidId: bidId,
        escrow,
      };
      return updated;
    });
    this.jobs$.next(jobs);
    this.saveJobs(jobs);
    if (bid) {
      this.recordActivity({
        id: 'act-' + Date.now(),
        type: 'winner_selected',
        jobId,
        bidId,
        amount: bid.price,
        timestamp: new Date().toISOString(),
      });
    }
    return this.getJob(jobId);
  }

  getEscrow(jobId: string): Observable<Escrow | null> {
    const job = this.jobs$.value.find((j) => j.id === jobId);
    return of(job?.escrow ?? null).pipe(delay(200));
  }

  fundEscrow(jobId: string): Observable<Escrow | null> {
    const jobs: Job[] = this.jobs$.value.map((j) =>
      j.id === jobId && j.escrow ? { ...j, escrow: { ...j.escrow, status: 'funded' } } : j
    );
    this.jobs$.next(jobs);
    this.saveJobs(jobs);
    const job = jobs.find((j) => j.id === jobId);
    if (job?.escrow) {
      this.recordActivity({
        id: 'act-' + Date.now(),
        type: 'escrow_funded',
        jobId,
        bidId: job.escrow.bidId,
        amount: job.escrow.gross,
        timestamp: new Date().toISOString(),
      });
    }
    return of(job?.escrow ?? null).pipe(delay(300));
  }

  releaseEscrow(jobId: string): Observable<Escrow | null> {
    const jobs: Job[] = this.jobs$.value.map((j) =>
      j.id === jobId && j.escrow ? { ...j, escrow: { ...j.escrow, status: 'released' } } : j
    );
    this.jobs$.next(jobs);
    this.saveJobs(jobs);
    const job = jobs.find((j) => j.id === jobId);
    if (job?.escrow) {
      this.recordActivity({
        id: 'act-' + Date.now(),
        type: 'escrow_released',
        jobId,
        bidId: job.escrow.bidId,
        amount: job.escrow.net,
        timestamp: new Date().toISOString(),
      });
    }
    return of(job?.escrow ?? null).pipe(delay(300));
  }
 
  listActivities(): Observable<Activity[]> {
    return this.activities$.asObservable();
  }
 
  private recordActivity(a: Activity) {
    const next = [a, ...this.activities$.value].slice(0, 100);
    this.activities$.next(next);
    this.saveActivities(next);
  }

  private saveJobs(jobs: Job[]) {
    localStorage.setItem('tapsosa.jobs', JSON.stringify(jobs));
  }

  private saveBids(bids: Bid[]) {
    localStorage.setItem('tapsosa.bids', JSON.stringify(bids));
  }

  private loadJobs(): Job[] {
    const raw = localStorage.getItem('tapsosa.jobs');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
      }
    }
    return [
      {
        id: 'seed-1',
        title: 'Event Security',
        category: 'Guarding Services',
        location: 'Gauteng',
        minBudget: 20000,
        maxBudget: 40000,
        bidDeadline: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        verified: true,
        chosenBidId: null,
        escrow: null,
      },
      {
        id: 'seed-2',
        title: 'Alarm Install',
        category: 'Technology',
        location: 'Western Cape',
        minBudget: 15000,
        maxBudget: 30000,
        bidDeadline: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        verified: true,
        chosenBidId: null,
        escrow: null,
      },
      {
        id: 'seed-3',
        title: 'Training Session',
        category: 'Training',
        location: 'KZN',
        minBudget: 10000,
        maxBudget: 18000,
        bidDeadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        verified: true,
        chosenBidId: null,
        escrow: null,
      },
    ];
  }

  private loadBids(): Bid[] {
    const raw = localStorage.getItem('tapsosa.bids');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [
      { id: 'bid-1', jobId: 'seed-1', supplierName: 'SecureCo', price: 22000, message: 'Experienced event team', days: 3, createdAt: new Date().toISOString() },
      { id: 'bid-2', jobId: 'seed-1', supplierName: 'GuardPro', price: 25000, message: 'All guards PSIRA registered', days: 3, createdAt: new Date().toISOString() },
      { id: 'bid-3', jobId: 'seed-2', supplierName: 'TechSecure', price: 18000, message: 'Fast install + warranty', days: 5, createdAt: new Date().toISOString() },
    ];
  }
 
  private loadActivities(): Activity[] {
    const raw = localStorage.getItem('tapsosa.activities');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  }
 
  private saveActivities(acts: Activity[]) {
    localStorage.setItem('tapsosa.activities', JSON.stringify(acts));
  }
}

export interface Bid {
  id: string;
  jobId: string;
  supplierName: string;
  price: number;
  message: string;
  days: number;
  createdAt: string;
}

export interface Escrow {
  bidId: string;
  gross: number;
  fee: number;
  net: number;
  status: 'pending' | 'funded' | 'released';
}
 
export interface Activity {
  id: string;
  type: 'bid_submitted' | 'winner_selected' | 'escrow_funded' | 'escrow_released';
  jobId: string;
  bidId?: string;
  amount?: number;
  timestamp: string;
}
