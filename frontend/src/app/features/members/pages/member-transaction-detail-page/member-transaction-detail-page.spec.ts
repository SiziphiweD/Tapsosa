import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemberTransactionDetailPage } from './member-transaction-detail-page';
import type { Job, Bid } from '../../../../shared/services/mock-api.service';

describe('MemberTransactionDetailPage logic', () => {
  let page: MemberTransactionDetailPage;

  beforeEach(() => {
    page = Object.create(MemberTransactionDetailPage.prototype) as any;
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
      escrow: null,
      ...overrides,
    } as Job);

  const makeBid = (overrides: Partial<Bid> = {}): Bid =>
    ({
      id: 'bid-1',
      jobId: 'job-1',
      supplierId: 'supplier-1',
      supplierName: 'Supplier One',
      price: 1000,
      days: 10,
      message: '',
      createdAt: new Date().toISOString(),
      ...overrides,
    } as Bid);

  it('computes compliance meta from documents', () => {
    const key = 'tapsosa.compliance.supplier-1';
    const docs = [
      { status: 'Uploaded' },
      { status: 'Pending' },
    ];
    localStorage.setItem(key, JSON.stringify(docs));

    const meta = (page as any).computeComplianceMeta('supplier-1') as {
      label: string;
      completeness: number;
    };

    expect(meta.label).toBe('Partial');
    expect(meta.completeness).toBe(50);
  });

  it('maps status and compliance labels to classes', () => {
    expect((page as any).mapStatusClass('Approved')).toBe('chip-status-approved');
    expect((page as any).mapStatusClass('Rejected')).toBe('chip-status-rejected');
    expect((page as any).mapStatusClass('Pending')).toBe('chip-status-pending');
    expect((page as any).mapStatusClass('Other')).toBe('');

    expect((page as any).mapComplianceClass('Complete')).toBe('chip-compliance-complete');
    expect((page as any).mapComplianceClass('Partial')).toBe('chip-compliance-partial');
    expect((page as any).mapComplianceClass('No documents')).toBe('chip-compliance-none');
  });

  it('loads winning bid and supplier meta from listBids and localStorage', () => {
    const users = [{ id: 'supplier-1', status: 'Approved' }];
    localStorage.setItem('tapsosa.users', JSON.stringify(users));
    localStorage.setItem(
      'tapsosa.compliance.supplier-1',
      JSON.stringify([{ status: 'Uploaded' }])
    );

    const job = makeJob({ chosenBidId: 'bid-1' });
    const bids = [makeBid()];

    (page as any).api = {
      listBids: (jobId: string) => ({
        subscribe: (fn: (all: Bid[]) => void) => fn(bids.filter((b) => b.jobId === jobId)),
      }),
    };

    (page as any).loadBid(job);

    expect(page.winningBid?.id).toBe('bid-1');
    expect(page.supplierStatus).toBe('Approved');
    expect(page.complianceLabel).toBe('Complete • 100%');
    expect(page.supplierStatusClass).toBe('chip-status-approved');
    expect(page.complianceClass).toBe('chip-compliance-complete');
  });
});

