import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 

function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; 
  }
}

export function roleGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = localStorage.getItem('token');

    if (!token || tokenExpirado(token)) {
      localStorage.clear();
      router.navigate(['/login']);
      return false;
    }

    if (authService.tieneAcceso(rolesPermitidos)) {
      return true;
    }

    router.navigate(['/no-autorizado']);
    return false;
  };
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token || tokenExpirado(token)) {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  return true;
};