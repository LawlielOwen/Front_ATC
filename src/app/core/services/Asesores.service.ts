import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Asesor } from "../../shared/model/asesor.model";
import { Observable } from 'rxjs';
export interface RespuestaPaginadaAsesores {
    a: Asesor[];
    total: number;
    paginas: number;
    paginaActual: number;
}
@Injectable({
    providedIn: 'root',
})
export class AsesoresService {
    private apiUrl = environment.apiurl;

    constructor(private http: HttpClient) { }
    getAsesor() {
        return this.http.get<Asesor>(`${this.apiUrl}/asesores`);
    }
    getAsesores(rol?: string): Observable<Asesor[]> {
        let params = new HttpParams();
        if (rol) {
            params = params.set('rol', rol);
        }
        return this.http.get<Asesor[]>(`${this.apiUrl}/asesores/rol`, { params });
    }
    addAsesor(asesor: Asesor | any) {
        return this.http.post(`${this.apiUrl}/asesores`, asesor);
    }
  
    updateAsesor(id: number, asesor: Asesor | any) {
        return this.http.put(`${this.apiUrl}/asesores/${id}`, asesor);
    }

    deleteAsesor(id: number) {
        return this.http.delete(`${this.apiUrl}/asesores/${id}`);
    }

    buscarAsesores(busqueda: string = '', estatus: number = -1, pagina: number = 1, limite: number = 10): Observable<RespuestaPaginadaAsesores> {
        let params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString())
            .set('estatus', estatus.toString());

        if (busqueda) {
            params = params.set('busqueda', busqueda);
        }

        return this.http.get<RespuestaPaginadaAsesores>(`${this.apiUrl}/asesores/buscar`, { params });
    }

    cantidadAsesoresActivos(): Observable<{ total: number }> {
        return this.http.get<{ total: number }>(`${this.apiUrl}/asesores/count`);
    }
      registrarAsesor(asesor: Asesor | any){
        return this.http.post(`${this.apiUrl}/asesores/registro`, asesor);
    }

}