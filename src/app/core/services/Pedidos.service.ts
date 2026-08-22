import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Pedido, DetallePedido } from '../../shared/model/pedidos.model';

export interface RespuestaPaginada {
    pedidos: Pedido[]; 
    total: number;
    paginas: number;
    paginaActual: number;
}

@Injectable({
    providedIn: 'root',
})
export class PedidoService {
    private apiUrl = environment.apiurl;

    constructor(private http: HttpClient) { }

    obtenerPedidos(
        busqueda: string = '', 
        estatus: number = -1, 
        fechaInicio: string = '', 
        fechaFin: string = '',
        idAsesor: number | null,
        pagina: number = 1, 
        limite: number = 10
    ): Observable<RespuestaPaginada> {
        
        let params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());

        if (busqueda) {
            params = params.set('busqueda', busqueda);
        }
        
        if (estatus !== null && estatus !== undefined) {
            params = params.set('estatus', estatus.toString());
        }
        
        if (fechaInicio) {
            params = params.set('fechaInicio', fechaInicio);
        }
        
        if (fechaFin) {
            params = params.set('fechaFin', fechaFin);
        }
       if (idAsesor !== null) params = params.set('id_asesor', idAsesor.toString());  // NUEVO

        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/pedido`, { params });
    }

    // 2. Obtener los detalles (productos) de un pedido
    obtenerDetallesPedido(idPedido: number): Observable<DetallePedido[]> {
        return this.http.get<DetallePedido[]>(`${this.apiUrl}/pedido/${idPedido}`);
    }

    // 3. Subir la factura física (PDF, JPG, PNG)
    subirFactura(idPedido: number, archivoFactura: File): Observable<any> {
        const formData = new FormData();
        
        formData.append('factura', archivoFactura);

        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/factura`, formData);
    }

    // 4. Aceptar el pedido (Este verificará el Stock y la Factura en el backend)
    aceptarPedido(idPedido: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/aceptar`, {});
    }

    // 5. Cancelar el pedido
    cancelarPedido(idPedido: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/cancelar`, {});
    }
    pagarConCredito(idPedido: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/pagar-credito`, {});
    }
    obtenerEstadisticas(): Observable<{ pendientes: number, cancelados: number, pagados: number, total_mes: number }> {
        return this.http.get<{ pendientes: number, cancelados: number, pagados: number, total_mes: number }>(`${this.apiUrl}/pedido/estadisticas`);
    }
obtenerUrlFactura(rutaRelativa: string): string {
    if (!rutaRelativa) return '';
    if (rutaRelativa.startsWith('http')) return rutaRelativa;
    
    const partes = rutaRelativa.split(/[/\\]/);
    const nombreArchivo = partes[partes.length - 1]; 
    
    const baseUrl = this.apiUrl.replace(/\/api\/?$/, ''); 
    
    return `${baseUrl}/uploads/recibos/${nombreArchivo}`;
  }
}