import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProyectoSoporte } from '../../shared/model/proyectos-soporte.model';

@Injectable({
  providedIn: 'root',
})
export class ProyectosService {
  private apiUrl = environment.apiurl;

  constructor(private http: HttpClient) {}
  buscarProyectos(
    pagina: number = 1,
    limite: number = 10,
    busqueda: string = '',
    estatus: number | null = null,
    id_tecnico?: number,
    rol?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    if (estatus !== null) {
      params = params.set('estatus', estatus.toString());
    }
    if (id_tecnico) {
      params = params.set('id_tecnico', id_tecnico.toString());
    }
    if (rol) {
      params = params.set('rol', rol);
    }

    return this.http.get(`${this.apiUrl}/proyectos`, { params });
  }


  altaProyecto(proyectoData: {
    nombre_proyecto: string;
    descripcion: string;
    id_tecnico: number;
    id_cliente: number | null;
    empresa_no_registrada: string | null;
    materiales: any[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos`, proyectoData);
  }

  modificarProyecto(id_proyecto: number, proyectoData: {
    nombre_proyecto: string;
    descripcion: string;
    id_cliente: number | null;
    empresa_no_registrada: string | null;
    materiales: any[];
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/proyectos/${id_proyecto}`, proyectoData);
  }
registrarAvance(
  id_proyecto: number,
  comentarios: string,
  nuevo_estatus: number | null = null,
  se_cotizo: number | null = null,
  tipo_evento: string = 'cambio_estatus'
): Observable<any> {
  const payload = {
    comentarios,
    nuevo_estatus,
    se_cotizo,
    tipo_evento
  };
  return this.http.post(`${this.apiUrl}/proyectos/${id_proyecto}/avances`, payload);
}
  obtenerMetricaMes(id_tecnico?: number, rol?: string): Observable<any> {
    let params = new HttpParams();
    
    if (id_tecnico) params = params.set('id_tecnico', id_tecnico.toString());
    if (rol) params = params.set('rol', rol);

    return this.http.get(`${this.apiUrl}/proyectos/metricas/mes`, { params });
  }
  obtenerMateriales(id_proyecto: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos/${id_proyecto}/materiales`);
  }
  finalizarProyecto(id_proyecto: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/proyectos/${id_proyecto}/finalizar`, {});
  }
  obtenerBitacora(id_proyecto: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos/${id_proyecto}/bitacora`);
  }
}