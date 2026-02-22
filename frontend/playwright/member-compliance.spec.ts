import { test, expect } from '@playwright/test';

test.describe('Member compliance risk views', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      const now = new Date().toISOString();
      const member = {
        id: 'member-1',
        role: 'member',
        email: 'member@test.local',
        name: 'Member Automation',
        passwordHash: 'x',
        createdAt: now,
        status: 'Approved',
      };
      const supplierApproved = {
        id: 'seed-supplier-1',
        role: 'supplier',
        email: 'supplier1@test.local',
        name: 'SecureCo',
        passwordHash: 'x',
        createdAt: now,
        status: 'Approved',
      };
      const supplierPartial = {
        id: 'seed-supplier-3',
        role: 'supplier',
        email: 'supplier3@test.local',
        name: 'TechSecure',
        passwordHash: 'x',
        createdAt: now,
        status: 'Pending',
      };
      const users = [member, supplierApproved, supplierPartial];
      localStorage.setItem('tapsosa.users', JSON.stringify(users));
      localStorage.setItem('tapsosa.currentUser', JSON.stringify(member));
      const completeDocs = [
        { status: 'Uploaded' },
        { status: 'Uploaded' },
        { status: 'Uploaded' },
        { status: 'Uploaded' },
        { status: 'Uploaded' },
      ];
      const partialDocs = [
        { status: 'Uploaded' },
        { status: 'Pending' },
        { status: 'Pending' },
        { status: 'Pending' },
        { status: 'Pending' },
      ];
      localStorage.setItem('tapsosa.compliance.seed-supplier-1', JSON.stringify(completeDocs));
      localStorage.setItem('tapsosa.compliance.seed-supplier-3', JSON.stringify(partialDocs));
    });
  });

  test('shows consistent compliance and status across member views', async ({ page }) => {
    await page.goto('/member/transactions');
    await expect(page.getByRole('heading', { name: 'Member Transactions' })).toBeVisible();
    const guardRow = page.getByRole('row', { name: /Guard Uniforms for Event/ });
    await expect(guardRow).toBeVisible();
    await expect(guardRow.getByText('SecureCo')).toBeVisible();
    await expect(guardRow.getByText(/Approved/)).toBeVisible();
    await expect(guardRow.getByText(/Complete • 100%/)).toBeVisible();
    await guardRow.getByRole('link', { name: 'View' }).click();
    await expect(page.getByRole('heading', { name: 'Escrow Transaction' })).toBeVisible();
    await expect(page.getByText('SecureCo')).toBeVisible();
    await expect(page.getByText(/Status:\s*Approved/)).toBeVisible();
    await expect(page.getByText(/Compliance:\s*Complete • 100%/)).toBeVisible();
    await page.getByRole('link', { name: 'Back to Transactions' }).click();
    await guardRow.getByRole('link', { name: 'View' }).click();
    const jobIdText = await page.getByText(/Transaction ID/).textContent();
    if (!jobIdText) {
      throw new Error('Transaction ID not found');
    }
    const match = jobIdText.match(/seed-\d+/);
    const jobId = match ? match[0] : 'seed-1';
    await page.goto(`/member/requests/${jobId}/bids`);
    await expect(page.getByRole('heading', { name: 'Bid Comparison' })).toBeVisible();
    const bidCard = page.getByText('SecureCo').first().locator('..').locator('..');
    await expect(bidCard.getByText(/Supplier Status:/)).toBeVisible();
    await expect(bidCard.getByText(/Approved/)).toBeVisible();
    await expect(bidCard.getByText(/Compliance:/)).toBeVisible();
    await expect(bidCard.getByText(/Complete • 100%/)).toBeVisible();
  });
});

