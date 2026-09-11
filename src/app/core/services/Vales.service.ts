import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ValeSalida } from '../../shared/model/vales.model';

export interface RespuestaPaginada {
    v: ValeSalida[];
    total: number;
    paginas: number;
    paginaActual: number;
}
export interface CotizacionDisponibleVale {
    id: number;
    num_cotizacion: string;
    id_cliente: number | null;
    id_asesor: number;
    nombre_cliente: string | null;
    nombre_asesor: string;
    fecha: string;
    orden_compra: string;
}
export interface ProductoCotizacionVale {
    id_detalle: number;
    id_producto: number | null;
    codigo_producto: string | null;
    nombre_producto: string | null;
    extra_descripcion: string | null;
    piezas: number;
    codigo_manual: string | null;
    descripcion_manual: string | null;
    extra_descripcion_manual: string | null;
}
export interface ResultadoValeCotizacion {
    mensaje: string;
    id_nuevo_vale: number;
    folio_generado: string;
}

@Injectable({ providedIn: 'root' })
export class ValeService {
    private apiUrl = environment.apiurl;
    constructor(private http: HttpClient) {}
    getVal(pagina: number = 1, limite: number = 10): Observable<RespuestaPaginada> {
        const params = new HttpParams().set('pagina', pagina.toString()).set('limite', limite.toString());
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/vales`, { params });
    }
    obtenerStatsVales(id: number, rol: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/vales/count`, { params: { id: id.toString(), rol } });
    }
    buscarVal(id_asesor: number | null = null, busqueda: string = '', estatus: number | null = null,
        fechaInicio: string = '', fechaFin: string = '', pagina: number = 1, limite: number = 10): Observable<RespuestaPaginada> {
        let params = new HttpParams().set('pagina', pagina.toString()).set('limite', limite.toString());
        if (id_asesor !== null) params = params.set('id_asesor', id_asesor.toString());
        if (busqueda) params = params.set('busqueda', busqueda);
        if (estatus !== null) params = params.set('estatus', estatus.toString());
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/vales/buscar`, { params });
    }
    aceptarVal(id: number, comentarios: string, id_asesor: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/vales/aceptar`, { id, comentarios, id_asesor });
    }
    rechazarVal(id: number, comentarios: string, id_asesor: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/vales/rechazar`, { id, comentarios, id_asesor });
    }
    buscarProductos(codigo: string, id_proveedor?: number) {
        let params = new HttpParams().set('codigo', codigo);
        if (id_proveedor) params = params.set('proveedor', id_proveedor.toString());
        return this.http.get<any>(`${this.apiUrl}/vales/producto`, { params });
    }
    crearVale(payload: any) { return this.http.post(`${this.apiUrl}/vales`, payload); }
    getValId(id: number) { return this.http.get<ValeSalida>(`${this.apiUrl}/vales/${id}`); }
    obtenerPedidosDisponiblesVale(idAsesor: number, rolUsuario: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/vales/pedidos/disponibles-vale`, {
            params: { id_asesor: idAsesor.toString(), rol: rolUsuario }
        });
    }
     obtenerCotizacionesDisponiblesVale(idAsesor: number): Observable<CotizacionDisponibleVale[]> {
        return this.http.get<CotizacionDisponibleVale[]>(`${this.apiUrl}/vales/cotizaciones/disponibles-vale`, {
            params: { id_asesor: idAsesor.toString() }
        });
    }
    obtenerProductosCotizacionVale(idCotizacion: number, idAsesor: number): Observable<ProductoCotizacionVale[]> {
        return this.http.get<ProductoCotizacionVale[]>(`${this.apiUrl}/vales/cotizaciones/${idCotizacion}/productos`, {
            params: { id_asesor: idAsesor.toString() }
        });
    }
    crearValeDesdeCotizacion(idCotizacion: number, idAsesor: number): Observable<ResultadoValeCotizacion> {
        return this.http.post<ResultadoValeCotizacion>(`${this.apiUrl}/vales/cotizaciones`, {
            id_cotizacion: idCotizacion,
            id_asesor: idAsesor
        });
    }
    crearValeDemo(payload: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/vales/demo`, payload);
    }
    aceptarValeDemo(id: number, comentarios: string, id_asesor: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/vales/demo/aceptar`, { id, comentarios, id_asesor });
    }
    obtenerVisitasDisponiblesVale(id_tecnico: number) {
        return this.http.get(`${this.apiUrl}/vales/visitas/disponibles-vale/${id_tecnico}`);
    }
}