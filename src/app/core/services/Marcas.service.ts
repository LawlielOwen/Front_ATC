import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Marcas } from "../../shared/model/marcas.model";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MarcaService {
    private apiUrl = environment.apiurl;
    constructor(private http: HttpClient) { }

    getMarcasActivas(busqueda?: string): Observable<Marcas[]> {
        let params = new HttpParams();
        if (busqueda) {
            params = params.set('busqueda', busqueda);
        }
        return this.http.get<Marcas[]>(`${this.apiUrl}/marcas/activas`, { params });
    }

    getMarcasConConteos(busqueda: string | null, estatus: number | null, pagina: number, limite: number): Observable<any> {
        let params = new HttpParams()
            .set('pagina', pagina)
            .set('limite', limite);

        if (busqueda) params = params.set('busqueda', busqueda);
        if (estatus !== null) params = params.set('estatus', estatus);

        return this.http.get(`${this.apiUrl}/marcas`, { params });
    }

    agregarMarca(nombre: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/marcas`, { Nombre: nombre });
    }

    modificarMarca(id: number, nombre: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/marcas/${id}`, { Nombre: nombre });
    }

    eliminarMarca(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/marcas/${id}/eliminar`, {});
    }

    activarMarca(id: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/marcas/${id}/activar`, {});
    }
}