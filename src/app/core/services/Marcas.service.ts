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

    getMarca() {
        return this.http.get(`${this.apiUrl}/marcas`);
    }
}