import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const esRutaPublica = req.url.includes('/login') || req.url.includes('/asesores/registro');

  if (token && !esRutaPublica) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};