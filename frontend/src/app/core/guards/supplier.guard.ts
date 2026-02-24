import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

export const supplierApprovedGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser$.value;

  if (!user) {
    router.navigate(['/auth/sign-in']);
    return false;
  }

  if (user.role !== 'supplier') {
    router.navigate(['/']);
    return false;
  }

  const status = (user.status || 'Pending').toLowerCase();
  if (status !== 'approved') {
    router.navigate(['/supplier/compliance']);
    return false;
  }

  return true;
};

