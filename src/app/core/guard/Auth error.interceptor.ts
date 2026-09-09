import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/Session.Service'; // ajusta la ruta real

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);

  return next(req).pipe(
    catchError((error) => {
      const esRutaLogin = req.url.includes('/login');

      if (error.status === 401 && !esRutaLogin) {
        sessionService.sesionExpirada();
      }

      if (error.status === 403) {
        router.navigate(['/no-autorizado']);
      }

      return throwError(() => error);
    })
  );
};