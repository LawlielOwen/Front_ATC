import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Asesor } from "../../shared/model/asesor.model";
import { Observable } from 'rxjs';
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
}