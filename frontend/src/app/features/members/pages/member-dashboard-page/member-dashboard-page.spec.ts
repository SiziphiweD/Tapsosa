import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemberDashboardPage } from './member-dashboard-page';
import type { Job } from '../../../../shared/services/mock-api.service';

describe('MemberDashboardPage logic', () => {
  let page: MemberDashboardPage & {
    jobs: Job[];
  };

  beforeEach(() => {
    page = Object.create(MemberDashboardPage.prototype) as any;
    page.jobs = [];
    page.complianceAlerts = 0;
  });

  afterEach(() => {
    localStorage.clear();
  });

  const makeJob = (overrides: Partial<Job> = {}): Job =>
    ({
      id: 'job-1',
      title: 'Job One',
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

  it('sets zero complianceAlerts when there are no jobs', () => {
    page.jobs = [];

    (page as any).refreshComplianceAlerts();

    expect(page.complianceAlerts).toBe(0);
  });

  it('counts released escrows to non fully compliant suppliers as alerts', () => {
    const jobsStorage = [
      { id: 'job-1', chosenBidId: 'bid-1' },
      { id: 'job-2', chosenBidId: 'bid-2' },
    ];
    const bidsStorage = [
      { id: 'bid-1', jobId: 'job-1', supplierId: 'supplier-approved' },
      { id: 'bid-2', jobId: 'job-2', supplierId: 'supplier-pending' },
    ];
    const usersStorage = [
      { id: 'supplier-approved', status: 'Approved' },
      { id: 'supplier-pending', status: 'Pending' },
    ];

    localStorage.setItem('tapsosa.jobs', JSON.stringify(jobsStorage));
    localStorage.setItem('tapsosa.bids', JSON.stringify(bidsStorage));
    localStorage.setItem('tapsosa.users', JSON.stringify(usersStorage));
    localStorage.setItem(
      'tapsosa.compliance.supplier-approved',
      JSON.stringify([{ status: 'Uploaded' }])
    );
    localStorage.setItem(
      'tapsosa.compliance.supplier-pending',
      JSON.stringify([{ status: 'Pending' }])
    );

    page.jobs = [
      makeJob({ id: 'job-1', chosenBidId: 'bid-1' }),
      makeJob({
        id: 'job-2',
        chosenBidId: 'bid-2',
        escrow: { bidId: 'bid-2', status: 'released', gross: 500, fee: 25, net: 475 },
      }),
    ];

    (page as any).refreshComplianceAlerts();

    expect(page.complianceAlerts).toBe(1);
  });
});
