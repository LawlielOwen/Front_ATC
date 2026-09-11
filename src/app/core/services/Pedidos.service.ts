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

export interface NuevoPedidoInput {
    id_cliente: number;
    id_asesor: number;
    orden_compra?: string | null;
    moneda: string;
    tipo_cambio: number;
    vigencia_dias: number;
    detalles: DetallePedidoInput[];
}

export interface DetallePedidoInput {
    id_producto: number | null;
    codigo_manual?: string | null;
    descripcion_manual?: string | null;
    extra_descripcion_manual?: string | null;
    cantidad: number;
    precio_unitario: number;
    costo_flete: number;
}

export interface RespuestaPedidoCreado {
    id_pedido: number;
    mensaje: string;
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

    obtenerDetallesPedido(idPedido: number): Observable<DetallePedido[]> {
        return this.http.get<DetallePedido[]>(`${this.apiUrl}/pedido/${idPedido}`);
    }

    subirFactura(idPedido: number, archivoFactura: File): Observable<any> {
        const formData = new FormData();
        
        formData.append('factura', archivoFactura);

        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/factura`, formData);
    }

    aceptarPedido(idPedido: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/aceptar`, {});
    }

    cancelarPedido(idPedido: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/cancelar`, {});
    }
    pagarConCredito(idPedido: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pedido/${idPedido}/pagar-credito`, {});
    }
    obtenerEstadisticas(): Observable<{ pendientes: number, cancelados: number, pagados: number, total_mes: number }> {
        return this.http.get<{ pendientes: number, cancelados: number, pagados: number, total_mes: number }>(`${this.apiUrl}/pedido/estadisticas`);
    }

    crearPedidoDirecto(pedido: NuevoPedidoInput): Observable<RespuestaPedidoCreado> {
        return this.http.post<RespuestaPedidoCreado>(`${this.apiUrl}/pedido`, pedido);
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