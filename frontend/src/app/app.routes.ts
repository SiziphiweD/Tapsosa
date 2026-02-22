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
        path: 'about',
        loadComponent: () =>
          import('./features/public/pages/about-page/about-page').then((m) => m.AboutPage)
      },
      {
        path: 'how-it-works',
        loadComponent: () =>
          import('./features/public/pages/how-it-works-page/how-it-works-page').then(
            (m) => m.HowItWorksPage
          )
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./features/public/pages/pricing-page/pricing-page').then((m) => m.PricingPage)
      },
      {
        path: 'faqs',
        loadComponent: () =>
          import('./features/public/pages/faqs-page/faqs-page').then((m) => m.FaqsPage)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/pages/contact-page/contact-page').then((m) => m.ContactPage)
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
          },
          {
            path: 'forgot-password',
            loadComponent: () =>
              import('./features/auth/pages/forgot-password-page/forgot-password-page').then(
                (m) => m.ForgotPasswordPage
              )
          },
          {
            path: 'reset-password',
            loadComponent: () =>
              import('./features/auth/pages/reset-password-page/reset-password-page').then(
                (m) => m.ResetPasswordPage
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
            path: 'requests',
            loadComponent: () =>
              import('./features/members/pages/member-jobs-page/member-jobs-page').then(
                (m) => m.MemberJobsPage
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
          {
            path: 'notifications',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-notifications-page/member-notifications-page'
                  ).then((m) => m.MemberNotificationsPage),
              },
              {
                path: 'unread',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-notifications-unread-page/member-notifications-unread-page'
                  ).then((m) => m.MemberNotificationsUnreadPage),
              },
              {
                path: 'settings',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-notification-settings-page/member-notification-settings-page'
                  ).then((m) => m.MemberNotificationSettingsPage),
              },
            ],
          },
          {
            path: 'reports',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-reports-dashboard-page/member-reports-dashboard-page'
                  ).then((m) => m.MemberReportsDashboardPage),
              },
              {
                path: 'spending',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-reports-spending-page/member-reports-spending-page'
                  ).then((m) => m.MemberReportsSpendingPage),
              },
            ],
          },
          {
            path: 'settings',
            children: [
              {
                path: 'profile',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-settings-profile-page/member-settings-profile-page'
                  ).then((m) => m.MemberSettingsProfilePage),
              },
              {
                path: 'users',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-settings-users-page/member-settings-users-page'
                  ).then((m) => m.MemberSettingsUsersPage),
              },
              {
                path: 'security',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-settings-security-page/member-settings-security-page'
                  ).then((m) => m.MemberSettingsSecurityPage),
              },
              {
                path: 'preferences',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-settings-preferences-page/member-settings-preferences-page'
                  ).then((m) => m.MemberSettingsPreferencesPage),
              },
              {
                path: 'billing',
                loadComponent: () =>
                  import(
                    './features/members/pages/member-settings-billing-page/member-settings-billing-page'
                  ).then((m) => m.MemberSettingsBillingPage),
              },
              { path: '', pathMatch: 'full', redirectTo: 'profile' },
            ],
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
            path: 'jobs/recommended',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-jobs-recommended-page/supplier-jobs-recommended-page').then(
                (m) => m.SupplierJobsRecommendedPage
              )
          },
          {
            path: 'jobs/saved',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-jobs-saved-page/supplier-jobs-saved-page').then(
                (m) => m.SupplierJobsSavedPage
              )
          },
          {
            path: 'jobs/alerts',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-job-alerts-page/supplier-job-alerts-page').then(
                (m) => m.SupplierJobAlertsPage
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
          {
            path: 'earnings/payouts',
            loadComponent: () =>
              import('./features/payments/pages/payouts-history-page/payouts-history-page').then(
                (m) => m.PayoutsHistoryPage
              )
          },
          {
            path: 'earnings/pending',
            loadComponent: () =>
              import('./features/payments/pages/pending-payouts-page/pending-payouts-page').then(
                (m) => m.PendingPayoutsPage
              )
          },
          {
            path: 'earnings/withdraw',
            loadComponent: () =>
              import('./features/payments/pages/withdraw-page/withdraw-page').then(
                (m) => m.WithdrawPage
              )
          },
          {
            path: 'earnings/bank-accounts',
            loadComponent: () =>
              import('./features/payments/pages/bank-accounts-page/bank-accounts-page').then(
                (m) => m.BankAccountsPage
              )
          },
          {
            path: 'bids',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-bids-page/supplier-bids-page').then(
                (m) => m.SupplierBidsPage
              )
          },
          {
            path: 'bids/:bidId',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-bid-detail-page/supplier-bid-detail-page').then(
                (m) => m.SupplierBidDetailPage
              )
          },
          {
            path: 'contracts',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-contracts-page/supplier-contracts-page').then(
                (m) => m.SupplierContractsPage
              )
          },
          {
            path: 'contracts/:jobId',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-contract-detail-page/supplier-contract-detail-page').then(
                (m) => m.SupplierContractDetailPage
              )
          },
          {
            path: 'completed',
            loadComponent: () =>
              import('./features/suppliers/pages/supplier-completed-jobs-page/supplier-completed-jobs-page').then(
                (m) => m.SupplierCompletedJobsPage
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
            path: 'profile',
            loadComponent: () =>
              import('./features/admin/pages/admin-profile-page/admin-profile-page').then(
                (m) => m.AdminProfilePage
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
          {
            path: 'config',
            loadComponent: () =>
              import('./features/admin/pages/admin-platform-configuration-page/admin-platform-configuration-page').then(
                (m) => m.AdminPlatformConfigurationPage
              )
          },
          {
            path: 'content',
            loadComponent: () =>
              import('./features/admin/pages/admin-content-management-page/admin-content-management-page').then(
                (m) => m.AdminContentManagementPage
              )
          },
          {
            path: 'analytics',
            loadComponent: () =>
              import('./features/admin/pages/admin-analytics-reports-page/admin-analytics-reports-page').then(
                (m) => m.AdminAnalyticsReportsPage
              )
          },
          {
            path: 'system',
            loadComponent: () =>
              import('./features/admin/pages/admin-system-security-page/admin-system-security-page').then(
                (m) => m.AdminSystemSecurityPage
              )
          },
          {
            path: 'users',
            children: [
              {
                path: 'members',
                loadComponent: () =>
                  import('./features/admin/pages/admin-users-members-page/admin-users-members-page').then(
                    (m) => m.AdminUsersMembersPage
                  )
              },
              {
                path: 'suppliers',
                loadComponent: () =>
                  import('./features/admin/pages/admin-users-suppliers-page/admin-users-suppliers-page').then(
                    (m) => m.AdminUsersSuppliersPage
                  )
              },
              {
                path: 'admins',
                loadComponent: () =>
                  import('./features/admin/pages/admin-users-admins-page/admin-users-admins-page').then(
                    (m) => m.AdminUsersAdminsPage
                  )
              },
              { path: '', pathMatch: 'full', redirectTo: 'members' },
            ],
          },
          {
            path: 'jobs',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/pages/admin-jobs-page/admin-jobs-page').then(
                    (m) => m.AdminJobsPage
                  )
              },
              {
                path: 'categories',
                loadComponent: () =>
                  import('./features/admin/pages/admin-job-categories-page/admin-job-categories-page').then(
                    (m) => m.AdminJobCategoriesPage
                  )
              },
            ],
          },
          {
            path: 'finance',
            children: [
              {
                path: 'revenue',
                loadComponent: () =>
                  import('./features/admin/pages/admin-finance-revenue-page/admin-finance-revenue-page').then(
                    (m) => m.AdminFinanceRevenuePage
                  )
              },
              {
                path: 'transactions',
                loadComponent: () =>
                  import('./features/admin/pages/admin-finance-transactions-page/admin-finance-transactions-page').then(
                    (m) => m.AdminFinanceTransactionsPage
                  )
              },
              {
                path: 'escrow',
                loadComponent: () =>
                  import('./features/admin/pages/admin-finance-escrow-page/admin-finance-escrow-page').then(
                    (m) => m.AdminFinanceEscrowPage
                  )
              },
              { path: '', pathMatch: 'full', redirectTo: 'revenue' },
            ],
          },
          {
            path: 'support',
            children: [
              {
                path: 'disputes',
                loadComponent: () =>
                  import('./features/admin/pages/admin-support-disputes-page/admin-support-disputes-page').then(
                    (m) => m.AdminSupportDisputesPage
                  )
              },
            ],
          },
          {
            path: 'compliance',
            children: [
              {
                path: 'dashboard',
                loadComponent: () =>
                  import('./features/admin/pages/admin-compliance-dashboard-page/admin-compliance-dashboard-page').then(
                    (m) => m.AdminComplianceDashboardPage
                  )
              },
              { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            ],
          },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
