import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { Cotizacion } from '../../shared/model/cotizacion.model';

export interface RespuestaPaginada {
    c: Cotizacion[];
    total: number;
    paginas: number;
    paginaActual: number;
}
@Injectable({
    providedIn: 'root',
})
export class CotizacionService {
    private apiUrl = environment.apiurl;
    constructor(private http: HttpClient) { }

buscarCotizacion(
        busqueda: string = '', 
        estatus: number | null = null, 
        fechaInicio: string = '',
        fechaFin: string = '', 
        ordenTotal: string = '', 
        pagina: number = 1, 
        limite: number = 10
    ): Observable<RespuestaPaginada> {
        
        let params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());

        if (busqueda) params = params.set('busqueda', busqueda);
        if (estatus !== null) params = params.set('estatus', estatus.toString());
        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        if (ordenTotal) params = params.set('ordenTotal', ordenTotal);

        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/cotizaciones`, { params });
    }
    obtenerTipoCambioDelDia(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/tipo-cambio`);
    }
    obtenerEstadisticasMensuales(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/cotizaciones/mensual`);
    }
    buscarProductoParaPOS(busqueda: string, id_proveedor: number | null = null): Observable<any> {
        let params = new HttpParams().set('busqueda', busqueda);
        if (id_proveedor !== null) {
            params = params.set('proveedor', id_proveedor.toString());
        }
        return this.http.get<any>(`${this.apiUrl}/cotizaciones/productos`, { params });
    }
    obtenerCotizacionPorId(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/cotizaciones/${id}`);
    }
    crearCotizacion(payload: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cotizaciones`, payload);
    }
    modificarCotizacion(id: number, payload: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/cotizaciones/${id}`, payload);
    }
convertirAPedido(idCotizacion: number, ordenCompra: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cotizaciones/${idCotizacion}/convertir`, { 
        orden_compra: ordenCompra 
    });
}
    cancelarCotizacion(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/cotizaciones/${id}`);
    }
    descargarPDF(idCotizacion: number): Observable<Blob> {
    // La opción responseType: 'blob' es vital para descargar archivos binarios
    return this.http.get(`${this.apiUrl}/cotizaciones/${idCotizacion}/pdf`, {
      responseType: 'blob'
    });
}
verPdfCotizacion(idCotizacion: number) {
    return this.http.get(`${this.apiUrl}/cotizaciones/${idCotizacion}/pdf`, {
      responseType: 'blob'
    });
  }
  vincularClienteCotizacion(idCotizacion: number, idNuevoCliente: number) {
  return this.http.put(`${this.apiUrl}/cotizaciones/${idCotizacion}/vincular-cliente`, {
    id_cliente: idNuevoCliente
  });
}
}