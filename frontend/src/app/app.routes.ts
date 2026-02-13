import { Routes } from '@angular/router';

import { AppLayout } from './shared/layout/app-layout/app-layout';
import { PublicLayout } from './shared/layout/public-layout/public-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/pages/landing-page/landing-page').then((m) => m.LandingPage)
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./features/public/pages/supplier-directory-page/supplier-directory-page').then(
            (m) => m.SupplierDirectoryPage
          )
      },
      {
        path: 'suppliers/:supplierId',
        loadComponent: () =>
          import('./features/public/pages/supplier-profile-page/supplier-profile-page').then(
            (m) => m.SupplierProfilePage
          )
      },
      {
        path: 'auth',
        children: [
          {
            path: 'sign-in',
            loadComponent: () =>
              import('./features/auth/pages/sign-in-page/sign-in-page').then((m) => m.SignInPage)
          },
          {
            path: 'register-member',
            loadComponent: () =>
              import('./features/auth/pages/register-member-page/register-member-page').then(
                (m) => m.RegisterMemberPage
              )
          },
          {
            path: 'register-supplier',
            loadComponent: () =>
              import('./features/auth/pages/register-supplier-page/register-supplier-page').then(
                (m) => m.RegisterSupplierPage
              )
          }
        ]
      }
    ]
  },
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: 'member',
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/members/pages/member-dashboard-page/member-dashboard-page').then(
                (m) => m.MemberDashboardPage
              )
          },
          {
            path: 'suppliers',
            loadComponent: () =>
              import(
                './features/members/pages/member-supplier-directory-page/member-supplier-directory-page'
              ).then((m) => m.MemberSupplierDirectoryPage)
          },
          {
            path: 'requests/new',
            loadComponent: () =>
              import('./features/marketplace/pages/post-request-page/post-request-page').then(
                (m) => m.PostRequestPage
              )
          },
          {
            path: 'requests/:jobId/bids',
            loadComponent: () =>
              import('./features/members/pages/member-view-bids-page/member-view-bids-page').then(
                (m) => m.MemberViewBidsPage
              )
          },
          {
            path: 'transactions',
            loadComponent: () =>
              import('./features/members/pages/member-transactions-page/member-transactions-page').then(
                (m) => m.MemberTransactionsPage
              )
          },
          {
            path: 'transactions/:transactionId',
            loadComponent: () =>
              import(
                './features/members/pages/member-transaction-detail-page/member-transaction-detail-page'
              ).then((m) => m.MemberTransactionDetailPage)
          },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      },
      {
        path: 'supplier',
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-dashboard-page/supplier-dashboard-page').then(
                (m) => m.SupplierDashboardPage
              )
          },
          {
            path: 'profile',
            loadComponent: () =>
              import(
                './features/suppliers/pages/supplier-profile-edit-page/supplier-profile-edit-page'
              ).then((m) => m.SupplierProfileEditPage)
          },
          {
            path: 'compliance',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-compliance-page/supplier-compliance-page').then(
                (m) => m.SupplierCompliancePage
              )
          },
          {
            path: 'jobs',
            loadComponent: () =>
              import('./features/marketplace/pages/browse-jobs-page/browse-jobs-page').then(
                (m) => m.BrowseJobsPage
              )
          },
          {
            path: 'jobs/:jobId',
            loadComponent: () =>
              import('./features/marketplace/pages/job-detail-page/job-detail-page').then(
                (m) => m.JobDetailPage
              )
          },
          {
            path: 'transactions',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-transactions-page/supplier-transactions-page').then(
                (m) => m.SupplierTransactionsPage
              )
          },
          {
            path: 'earnings',
            loadComponent: () =>
              import('./features/payments/pages/earnings-overview-page/earnings-overview-page').then(
                (m) => m.EarningsOverviewPage
              )
          },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      },
      {
        path: 'admin',
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/pages/admin-dashboard-page/admin-dashboard-page').then(
                (m) => m.AdminDashboardPage
              )
          },
          {
            path: 'suppliers/verification',
            loadComponent: () =>
              import(
                './features/admin/pages/supplier-verification-page/supplier-verification-page'
              ).then((m) => m.SupplierVerificationPage)
          },
          {
            path: 'transactions',
            loadComponent: () =>
              import('./features/admin/pages/transaction-audit-page/transaction-audit-page').then(
                (m) => m.TransactionAuditPage
              )
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./features/admin/pages/reports-page/reports-page').then((m) => m.ReportsPage)
          },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
