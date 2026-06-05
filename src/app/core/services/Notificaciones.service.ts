import { notificaciones } from '../../shared/model/notificacion.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { toast } from 'ngx-sonner';
@Injectable({
    providedIn: 'root',
})
export class notificacionService {
    private apiUrl = environment.apiurl;
    private socket: Socket;
    private notificacionSubject = new Subject<any>();
  constructor(private http: HttpClient) {
        const serverUrl = this.apiUrl.replace('/api', '');
        this.socket = io(serverUrl);
        
        this.socket.on('nueva_notificacion', (datos) => {
            // 2. Pasamos el dato al canal para que la campanita suba su número
            this.notificacionSubject.next(datos); 
            
            const audio = new Audio('/assets/Sound/notificacion.mp3'); 
            audio.play().catch(err => console.log('Auto-play bloqueado', err));
            const tituloToast = datos.titulo || datos.tipo_notificacion || 'Nueva Notificación';
            toast(tituloToast, {
                description: datos.mensaje
            });
        });
    }
    conectarUsuario(id: number, rol: string) {
        this.socket.emit('unirse_a_sala', { id, rol });
    }
    escucharNuevasNotificaciones(): Observable<any> {
        return this.notificacionSubject.asObservable();
    }
    obtenerHistorialNotificaciones(idAsesor: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/notificaciones/${idAsesor}`);
    }
    aceptarVal(id: number, comentarios: string, id_asesor: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/vales/aceptar`, { id, comentarios, id_asesor });
  }

  rechazarVal(id: number, comentarios: string, id_asesor: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/vales/rechazar`, { id, comentarios, id_asesor });
  }
  marcarTodasLeidas(idAsesor: number): Observable<any> {
      return this.http.put(`${this.apiUrl}/notificaciones/leer-todas/${idAsesor}`, {});
  }
}
