import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { ProductoRecepcion, PedidoTabla } from '../../shared/model/proveedor.model';

export interface RespuestaPaginada {
    p: PedidoTabla[];
    total: number;
    paginas: number;
    paginaActual: number;
}
@Injectable({
    providedIn: 'root',
})
export class ProveedorService {
    private apiUrl = environment.apiurl;
    constructor(private http: HttpClient) { }
    buscarPedido(busqueda: string = '', id_proveedor: number | null = null, estatus: number | null = null, fechaInicio: string = '',
        fechaFin: string = '', pagina: number = 1, limite: number = 10): Observable<RespuestaPaginada> {
        let params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());
        if (busqueda) {
            params = params.set('busqueda', busqueda);
        }
        if (id_proveedor !== null) {
            params = params.set('id_proveedor', id_proveedor.toString());
        }
        if (estatus !== null) {
            params = params.set('estatus', estatus.toString());
        }
        if (fechaInicio) {
            params = params.set('fechaInicio', fechaInicio);
        }
        if (fechaFin) {
            params = params.set('fechaFin', fechaFin);
        }
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/pedidos`, { params });
    }
    registrarPedido(payload: any) {
        return this.http.post(`${this.apiUrl}/pedidos`, payload);

    }
    recibirPedido(id_pedido: number, id_asesor: number): Observable<any> {
        const payload = { id_pedido, id_asesor };
        return this.http.put(`${this.apiUrl}/pedidos/recibir`, payload);
    }

    recibirPedidoIncidencia(id_pedido: number, id_asesor: number, productos: any[]): Observable<any> {
        const payload = { id_pedido, id_asesor, productos };
        return this.http.put(`${this.apiUrl}/pedidos/incidencia`, payload);
    }

    obtenerEstadisticasPedidos(anio?: number): Observable<any> {
        let params = new HttpParams();
                if (anio) {
            params = params.set('anio', anio.toString());
        }
        
        return this.http.get<any>(`${this.apiUrl}/pedidos/estadisticas`, { params });
    }
    consultarDetallesPedido(id_pedido: number) {
        return this.http.get<any>(`${this.apiUrl}/pedidos/${id_pedido}`);
    }
    consultarIncidentesPedido(id_pedido: number) {
    return this.http.get(`${this.apiUrl}/pedidos/incidentes/${id_pedido}`);
  }
  buscarProductos(codigo: string, id_proveedor?: number) {
        let url = `${this.apiUrl}/pedidos/producto?codigo=${codigo}`;
        if (id_proveedor) {
            url += `&proveedor=${id_proveedor}`;
        }
        return this.http.get<any>(url);
    }
}