import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { ValeSalida } from '../../shared/model/vales.model';

export interface RespuestaPaginada {
    v: ValeSalida[];
    total: number;
    paginas: number;
    paginaActual: number;
}
@Injectable({
    providedIn: 'root',
})
export class ValeService {
    private apiUrl = environment.apiurl;

    constructor(private http: HttpClient) {

    }

    getVal(pagina: number = 1, limite: number = 10): Observable<RespuestaPaginada> {
        const params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/vales`, { params });
    }
    obtenerStatsVales(id: number, rol: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/vales/count?id=${id}&rol=${rol}`);
    }
    buscarVal(id_asesor: number | null = null, busqueda: string = '', estatus: number | null = null, fechaInicio: string = '',
        fechaFin: string = '', pagina: number = 1, limite: number = 10): Observable<RespuestaPaginada> {
        let params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());
        if (id_asesor !== null) {
            params = params.set('id_asesor', id_asesor.toString());
        }
        if (busqueda) {
            params = params.set('busqueda', busqueda);
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
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/vales/buscar`, { params });
    }
    aceptarVal(id: number, comentarios: string, id_asesor: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/vales/aceptar`, { id, comentarios, id_asesor });
    }

    rechazarVal(id: number, comentarios: string, id_asesor: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/vales/rechazar`, { id, comentarios, id_asesor });
    }
    buscarProductos(codigo: string, id_proveedor?: number) {
        let url = `${this.apiUrl}/vales/producto?codigo=${codigo}`;
        if (id_proveedor) {
            url += `&proveedor=${id_proveedor}`;
        }
        return this.http.get<any>(url);
    }
    crearVale(payload: any) {
        return this.http.post(`${this.apiUrl}/vales`, payload);
    }
    getValId(id: number) {
        return this.http.get<ValeSalida>(`${this.apiUrl}/vales/${id}`);
    }
}