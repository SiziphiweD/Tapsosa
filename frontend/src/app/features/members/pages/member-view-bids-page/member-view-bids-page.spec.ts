import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemberViewBidsPage } from './member-view-bids-page';
import type { Bid } from '../../../../shared/services/mock-api.service';

describe('MemberViewBidsPage logic', () => {
  let page: MemberViewBidsPage & {
    supplierStatusById: Record<string, string>;
    complianceBySupplier: Record<string, { label: string; completeness: number }>;
  };

  beforeEach(() => {
    page = Object.create(MemberViewBidsPage.prototype) as any;
    page.supplierStatusById = {};
    page.complianceBySupplier = {};
  });

  afterEach(() => {
    localStorage.clear();
  });

  const makeBid = (overrides: Partial<Bid> = {}): Bid =>
    ({
      id: 'bid-1',
      jobId: 'job-1',
      supplierId: 'supplier-1',
      supplierName: 'Supplier One',
      price: 1000,
      days: 10,
      message: 'Test bid',
      createdAt: new Date().toISOString(),
      ...overrides,
    } as Bid);

  it('computes supplier status text and classes', () => {
    page.supplierStatusById = {
      'supplier-approved': 'Approved',
      'supplier-pending': 'Pending',
      'supplier-rejected': 'Rejected',
    };

    const approvedBid = makeBid({ id: 'b1', supplierId: 'supplier-approved' });
    const pendingBid = makeBid({ id: 'b2', supplierId: 'supplier-pending' });
    const rejectedBid = makeBid({ id: 'b3', supplierId: 'supplier-rejected' });
    const unknownBid = makeBid({ id: 'b4', supplierId: 'missing-id' });
    const noIdBid = makeBid({ id: 'b5', supplierId: '' as any });

    expect(page.getSupplierStatus(approvedBid)).toBe('Approved');
    expect(page.getSupplierStatusClass(approvedBid)).toBe('chip-status-approved');

    expect(page.getSupplierStatus(pendingBid)).toBe('Pending');
    expect(page.getSupplierStatusClass(pendingBid)).toBe('chip-status-pending');

    expect(page.getSupplierStatus(rejectedBid)).toBe('Rejected');
    expect(page.getSupplierStatusClass(rejectedBid)).toBe('chip-status-rejected');

    expect(page.getSupplierStatus(unknownBid)).toBe('Unknown');
    expect(page.getSupplierStatusClass(unknownBid)).toBe('');

    expect(page.getSupplierStatus(noIdBid)).toBe('Unknown');
    expect(page.getSupplierStatusClass(noIdBid)).toBe('');
  });

  it('computes compliance labels and classes from meta', () => {
    page.complianceBySupplier = {
      'supplier-complete': { label: 'Complete', completeness: 100 },
      'supplier-partial': { label: 'Partial', completeness: 50 },
      'supplier-none': { label: 'No documents', completeness: 0 },
    };

    const completeBid = makeBid({ id: 'b1', supplierId: 'supplier-complete' });
    const partialBid = makeBid({ id: 'b2', supplierId: 'supplier-partial' });
    const noneBid = makeBid({ id: 'b3', supplierId: 'supplier-none' });
    const unknownBid = makeBid({ id: 'b4', supplierId: 'missing-id' });
    const noIdBid = makeBid({ id: 'b5', supplierId: '' as any });

    expect(page.getComplianceLabel(completeBid)).toBe('Complete • 100%');
    expect(page.getComplianceClass(completeBid)).toBe('chip-compliance-complete');

    expect(page.getComplianceLabel(partialBid)).toBe('Partial • 50%');
    expect(page.getComplianceClass(partialBid)).toBe('chip-compliance-partial');

    expect(page.getComplianceLabel(noneBid)).toBe('No documents • 0%');
    expect(page.getComplianceClass(noneBid)).toBe('chip-compliance-none');

    expect(page.getComplianceLabel(unknownBid)).toBe('No documents');
    expect(page.getComplianceClass(unknownBid)).toBe('chip-compliance-none');

    expect(page.getComplianceLabel(noIdBid)).toBe('No documents');
    expect(page.getComplianceClass(noIdBid)).toBe('chip-compliance-none');
  });

  it('computes compliance meta from localStorage documents', () => {
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

  it('builds supplier meta from users and compliance data', () => {
    const users = [
      { id: 'supplier-1', status: 'Approved' },
      { id: 'supplier-2', status: 'Pending' },
    ];
    localStorage.setItem('tapsosa.users', JSON.stringify(users));
    localStorage.setItem(
      'tapsosa.compliance.supplier-1',
      JSON.stringify([{ status: 'Uploaded' }])
    );
    localStorage.setItem(
      'tapsosa.compliance.supplier-2',
      JSON.stringify([{ status: 'Pending' }])
    );

    const bids: Bid[] = [
      makeBid({ id: 'b1', supplierId: 'supplier-1' }),
      makeBid({ id: 'b2', supplierId: 'supplier-2' }),
    ];

    (page as any).buildSupplierMeta(bids);

    expect(page.supplierStatusById['supplier-1']).toBe('Approved');
    expect(page.supplierStatusById['supplier-2']).toBe('Pending');

    const meta1 = page.complianceBySupplier['supplier-1'];
    const meta2 = page.complianceBySupplier['supplier-2'];

    expect(meta1.label).toBe('Complete');
    expect(meta1.completeness).toBe(100);
    expect(meta2.label).toBe('No documents');
    expect(meta2.completeness).toBe(0);
  });

  it('sets warning when selecting non fully compliant supplier', () => {
    page.job = { id: 'job-1' } as any;
    page.bids = [
      makeBid({ id: 'b1', supplierId: 'supplier-1' }),
      makeBid({ id: 'b2', supplierId: 'supplier-2' }),
    ];
    page.supplierStatusById = {
      'supplier-1': 'Approved',
      'supplier-2': 'Pending',
    };
    page.complianceBySupplier = {
      'supplier-1': { label: 'Complete', completeness: 100 },
      'supplier-2': { label: 'Partial', completeness: 50 },
    };
    (page as any).api = {
      selectWinningBid: () => ({
        subscribe: () => undefined,
      }),
    };

    page.selectWinner('b1');
    expect(page.warning).toBeNull();

    page.selectWinner('b2');
    expect(page.warning).toContain('Warning: Selected supplier is not fully compliant');
  });
});

