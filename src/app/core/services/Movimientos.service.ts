import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Movimientos } from "../../shared/model/movimientos.model";
import { Observable } from 'rxjs';
export interface RespuestaPaginada {
    m: Movimientos[];
    total: number;
    paginas: number;
    paginaActual: number;
}
@Injectable({
    providedIn: 'root',
})
export class MovimientoService {
    private apiUrl = environment.apiurl;
    constructor(private http: HttpClient) { }

    getMov(pagina: number = 1, limite: number = 10): Observable<RespuestaPaginada> {
        const params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/movimientos`, { params });
    }
    salidaProducto(codigo: string, cantidad: number, destino: string, id_asesor: number, id_cliente: number) {
        const payload = {
            codigo: codigo,
            cantidad: cantidad,
            destino: destino,
            id_asesor: id_asesor,
            id_cliente: id_cliente
        };

        return this.http.post(`${this.apiUrl}/movimientos/salida`, payload);
    }
    movMensuales() {
        return this.http.get(`${this.apiUrl}/movimientos/count`);
    }
    consultarMov(busqueda: string = '', tipo: string = '', destino: string = '', fechaInicio: string = '',
        fechaFin: string = '', pagina: number = 1, limite: number = 10): Observable<RespuestaPaginada> {
        let params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());
        if (busqueda) {
            params = params.set('busqueda', busqueda);
        }
        if (tipo) {
            params = params.set('tipo', tipo);
        }
        if (destino) {
            params = params.set('destino', destino);
        }
        if (fechaInicio) {
            params = params.set('fechaInicio', fechaInicio);
        }
        if (fechaFin) {
            params = params.set('fechaFin', fechaFin);
        }
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/movimientos/buscar`, { params });
    }
    getMovId(id: number) {
        return this.http.get<Movimientos>(`${this.apiUrl}/movimientos/${id}`);
    }
}