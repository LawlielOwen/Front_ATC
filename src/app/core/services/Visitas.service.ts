import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { VisitaDemostracion, DetalleVisitaDemo, RespuestaPaginadaVisitas } from '../../shared/model/visita.model';

@Injectable({
  providedIn: 'root',
})
export class VisitaService {
  private apiUrl = environment.apiurl;

  constructor(private http: HttpClient) {}

  // 1. Consultar y filtrar visitas
 consultarVisitas(busqueda: string = '', estatus: number | null = null, id_tecnico: number | null = null, pagina: number = 1, limite: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    if (estatus !== null) {
      params = params.set('estatus', estatus.toString());
    }
    if (id_tecnico !== null) {
      params = params.set('id_tecnico', id_tecnico.toString()); // <-- PARÁMETRO CLAVE
    }

    return this.http.get(`${this.apiUrl}/visitas`, { params });
  }

  // 2. Obtener visita por ID (Datos generales)
  obtenerVisitaPorId(id: number): Observable<VisitaDemostracion> {
    return this.http.get<VisitaDemostracion>(`${this.apiUrl}/visitas/${id}`);
  }

  // 3. Obtener los detalles (equipos prestados) de una visita
  obtenerDetallesVisita(id: number): Observable<DetalleVisitaDemo[]> {
    return this.http.get<DetalleVisitaDemo[]>(`${this.apiUrl}/visitas/${id}/detalles`);
  }

  // 4. Crear/Programar visita
  crearVisita(datosVisita: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/visitas`, datosVisita);
  }

  // 5. Completar visita (Enviar el reporte y el estatus de retorno de los demos)
  completarVisita(id: number, resumen_actividades: string, retornos: any[]): Observable<any> {
    const payload = {
      resumen_actividades,
      retornos
    };
    return this.http.put(`${this.apiUrl}/visitas/${id}`, payload);
  }

  // 6. Cancelar visita
  cancelarVisita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/visitas/${id}`);
  }
    generarPDFVisita(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/visitas/${id}/pdf`, {
      responseType: 'blob'
    });
  }
}