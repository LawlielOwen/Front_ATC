import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

let alertaSesionMostrada = false;

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      const esRutaLogin = req.url.includes('/login');

   
      if (error.status === 401 && !esRutaLogin) {
        localStorage.clear();

        if (!alertaSesionMostrada) {
          alertaSesionMostrada = true;

          Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Tu sesión ha caducado por seguridad. Vuelve a iniciar sesión para continuar.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#003B8A',
            heightAuto: false,
            allowOutsideClick: false
          }).then(() => {
            alertaSesionMostrada = false;
            router.navigate(['/login']);
          });
        }
      }

      if (error.status === 403) {
        router.navigate(['/no-autorizado']);
      }

      return throwError(() => error);
    })
  );
};