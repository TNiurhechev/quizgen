import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth'; 

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const username = authService.getUsername();
  const hasToken = !!localStorage.getItem('token');

  if (authService.hasValidToken()) 
    return true;

  router.navigate(['/login']);
  return false;
};