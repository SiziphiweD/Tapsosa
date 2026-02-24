// Create file: src/app/core/guards/member.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

export const memberGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.currentUser$.value;
  
  if (!user) {
    router.navigate(['/auth/sign-in']);
    return false;
  }
  
  if (user.role !== 'member') {
    router.navigate(['/']);
    return false;
  }
  
  // Check status - only active members can access full member area
  if (user.status === 'Pending') {
    router.navigate(['/member/verification-pending']);
    return false;
  }
  
  if (user.status === 'Rejected') {
    router.navigate(['/']); // Or show a rejection message page
    return false;
  }
  
  return true;
};