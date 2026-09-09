// core/services/session.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private router = inject(Router);
  private timeoutId: any = null;
  private alertaMostrada = false;

  programarExpiracion(token: string) {
    this.cancelarMonitoreo();

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return;

      const msRestantes = (payload.exp * 1000) - Date.now();

      if (msRestantes <= 0) {
        this.sesionExpirada();
        return;
      }

      this.timeoutId = setTimeout(() => this.sesionExpirada(), msRestantes);
    } catch (error) {
      console.error('No se pudo leer la expiración del token', error);
    }
  }

  cancelarMonitoreo() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  sesionExpirada() {
    localStorage.clear();
    this.cancelarMonitoreo();

    if (this.alertaMostrada) return;
    this.alertaMostrada = true;

    Swal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Tu sesión ha caducado por seguridad. Vuelve a iniciar sesión para continuar.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#003B8A',
      heightAuto: false,
      allowOutsideClick: false
    }).then(() => {
      this.alertaMostrada = false;
      this.router.navigate(['/login']);
    });
  }
}