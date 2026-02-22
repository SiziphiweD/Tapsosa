import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemberTransactionsPage } from './member-transactions-page';
import type { Job, Activity } from '../../../../shared/services/mock-api.service';

describe('MemberTransactionsPage logic', () => {
  let page: MemberTransactionsPage & {
    jobs: Job[];
    activities: Activity[];
  };

  beforeEach(() => {
    page = Object.create(MemberTransactionsPage.prototype) as any;
    page.jobs = [];
    page.activities = [];
    page.rows = [];
  });

  afterEach(() => {
    localStorage.clear();
  });

  const makeJob = (overrides: Partial<Job> = {}): Job =>
    ({
      id: 'job-1',
      title: 'Test Job',
      description: '',
      category: '',
      createdAt: new Date().toISOString(),
      chosenBidId: 'bid-1',
      escrow: {
        bidId: 'bid-1',
        status: 'released',
        gross: 1000,
        fee: 50,
        net: 950,
      },
      ...overrides,
    } as any);

  const makeActivity = (overrides: Partial<Activity> = {}): Activity =>
    ({
      id: 'act-1',
      jobId: 'job-1',
      type: 'escrow_released',
      timestamp: new Date().toISOString(),
      amount: 950,
      ...overrides,
    } as Activity);

  it('computes compliance meta used in winning bid supplier lookup', () => {
    const key = 'tapsosa.compliance.supplier-1';
    const docs = [
      { status: 'Uploaded' },
      { status: 'Uploaded' },
      { status: 'Pending' },
    ];
    localStorage.setItem(key, JSON.stringify(docs));

    const meta = (page as any).computeComplianceMeta('supplier-1') as {
      label: string;
      completeness: number;
    };

    expect(meta.label).toBe('Partial');
    expect(meta.completeness).toBe(67);
  });

  it('builds rows with supplier name, status, and compliance label', () => {
    const jobsStorage = [
      { id: 'job-1', chosenBidId: 'bid-1' },
    ];
    const bidsStorage = [
      { id: 'bid-1', jobId: 'job-1', supplierId: 'supplier-1', supplierName: 'Supplier One' },
    ];
    const usersStorage = [
      { id: 'supplier-1', status: 'Approved' },
    ];
    localStorage.setItem('tapsosa.jobs', JSON.stringify(jobsStorage));
    localStorage.setItem('tapsosa.bids', JSON.stringify(bidsStorage));
    localStorage.setItem('tapsosa.users', JSON.stringify(usersStorage));
    localStorage.setItem(
      'tapsosa.compliance.supplier-1',
      JSON.stringify([{ status: 'Uploaded' }])
    );

    page.jobs = [makeJob()];
    page.activities = [makeActivity()];

    (page as any).refreshRows();

    expect(page.rows.length).toBe(1);
    const row = page.rows[0];
    expect(row.jobTitle).toBe('Test Job');
    expect(row.status).toBe('released');
    expect(row.statusLabel).toBe('Payment Released');
    expect(row.supplierName).toBe('Supplier One');
    expect(row.supplierStatus).toBe('Approved');
    expect(row.complianceLabel).toBe('Complete • 100%');
  });
});
