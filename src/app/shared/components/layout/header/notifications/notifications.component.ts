import { Component, OnInit, ViewChild } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";
import { IonicModule, PopoverController } from '@ionic/angular';
import { IonPopover } from '@ionic/angular';
import { notificacionService } from '../../../../../core/services/Notificaciones.service';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class NotificationsComponent implements OnInit {
  @ViewChild('popover') popover!: IonPopover;
  notificaciones: any[] = [];
  contadorNoLeidas: number = 0;
  usuarioLogueado: any = null;
  public Notification_id = 'user-trigger-' + Math.random().toString(36).substring(2, 9);
  constructor(private notificacionService: notificacionService, private router: Router) { }
 ngOnInit() {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.usuarioLogueado = JSON.parse(userString);

      if (this.usuarioLogueado.id && this.usuarioLogueado.Rol) {
        this.notificacionService.conectarUsuario(this.usuarioLogueado.id, this.usuarioLogueado.Rol);
      }

      this.cargarHistorial();

      this.notificacionService.escucharNuevasNotificaciones().subscribe({
        next: (nuevaNotif) => {
          this.notificaciones.unshift(nuevaNotif);
          this.contadorNoLeidas++;
        }
      });
    }
  }

  cargarHistorial() {
    this.notificacionService.obtenerHistorialNotificaciones(this.usuarioLogueado.id).subscribe({
      next: (res: any) => {
        this.notificaciones = res.notificaciones || [];
        this.contadorNoLeidas = this.notificaciones.filter(n => n.leida === 0).length;
      },
      error: (err) => {
        console.error('Error al cargar historial de notificaciones', err);
      }
    });
  }
  getEstiloNotificacion(notif: any) {
    const tipo = notif.tipo_notificacion || notif.titulo || '';

    switch (tipo) {
      case 'Vale Aceptado':
      case 'Vale Autorizado':
        return { icono: 'checkmark-circle-outline', bg: 'bg-emerald-100', color: 'text-emerald-600' };
      case 'Vale Rechazado':
        return { icono: 'close-circle-outline', bg: 'bg-red-100', color: 'text-red-600' };
      case 'Nueva Solicitud':
        return { icono: 'document-text-outline', bg: 'bg-blue-100', color: 'text-blue-600' };
      default:
        return { icono: 'alert-circle-outline', bg: 'bg-amber-100', color: 'text-amber-600' };
    }
  }
  marcarComoLeidas() {
    if (this.contadorNoLeidas > 0) {
      this.contadorNoLeidas = 0;

      this.notificaciones.forEach(notif => notif.leida = 1);
      if (this.usuarioLogueado && this.usuarioLogueado.id) {
        this.notificacionService.marcarTodasLeidas(this.usuarioLogueado.id).subscribe({
          error: (err) => console.error('Error al marcar como leídas en BD', err)
        });
      }
    }
  }
  irAModulo(notif: any) {
    // 1. Cerramos el menú desplegable (popover) para que no estorbe
    this.popover.dismiss();
    const tipo = notif.tipo_notificacion || notif.titulo || '';

    // 3. Redirigimos según la palabra clave
    if (tipo.includes('Vale') || tipo.includes('Solicitud')) {
      // Te lleva al módulo de vales
      this.router.navigate(['/vales']); 
      
    } else if (tipo.includes('Adeudo') || tipo.includes('Cliente')) {
      this.router.navigate(['/clientes']); 
      
    } else if (tipo.includes('Material')) {
      this.router.navigate(['/almacen']); 
      
    } else {
      this.router.navigate(['/inicio']); 
    }
  }
}
