import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.clear();
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        router.navigate(['/no-autorizado']);
      }

      return throwError(() => error);
    })
  );
};