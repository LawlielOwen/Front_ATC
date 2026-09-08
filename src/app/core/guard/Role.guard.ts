import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = localStorage.getItem('token');

    if (!token) {
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