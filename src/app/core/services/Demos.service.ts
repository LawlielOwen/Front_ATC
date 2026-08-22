import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { StockDemo, RespuestaPaginadaDemos } from '../../shared/model/demo.model';

@Injectable({
  providedIn: 'root',
})
export class DemoService {
  private apiUrl = environment.apiurl;

  constructor(private http: HttpClient) {}

  // 1. Consultar y filtrar demos
  consultarDemos(busqueda?: string | null, estatus?: number | null, marca?: number | null, pagina: number = 1, limite: number = 10): Observable<RespuestaPaginadaDemos> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (busqueda) params = params.set('busqueda', busqueda);
    if (estatus !== undefined && estatus !== null) params = params.set('estatus', estatus.toString());
    if (marca !== undefined && marca !== null) params = params.set('marca', marca.toString());

    return this.http.get<RespuestaPaginadaDemos>(`${this.apiUrl}/demos`, { params });
  }

  // 2. Agregar demo (Usando un objeto JSON en lugar de FormData, ya que no subimos archivos aquí)
  agregarDemo(demo: Partial<StockDemo>): Observable<any> {
    return this.http.post(`${this.apiUrl}/demos`, demo);
  }

  // 3. Modificar demo
  modificarDemo(id: number, demo: Partial<StockDemo>): Observable<any> {
    return this.http.put(`${this.apiUrl}/demos/${id}`, demo);
  }

  // 4. Eliminar (Dar de baja) demo
  eliminarDemo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/demos/${id}`);
  }

  // 5. Activar demo
  activarDemo(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/demos/${id}/activar`, {});
  }
  // 6. Buscar demos dinámicamente (Para el autocompletado en el modal de Visitas)
  buscarDemosParaVisita(busqueda: string, id_marca?: number): Observable<StockDemo[]> {
    let params = new HttpParams().set('busqueda', busqueda);

    if (id_marca !== undefined && id_marca !== null) {
      params = params.set('id_marca', id_marca.toString());
    }

    return this.http.get<StockDemo[]>(`${this.apiUrl}/demos/buscar`, { params });
  }
  registrarEntradaDemo(codigo: string, cantidad: number, id_asesor: number): Observable<any> {
    const payload = {
      codigo,
      cantidad,
      id_asesor
    };
        return this.http.post(`${this.apiUrl}/demos/entrada`, payload);
  }
}