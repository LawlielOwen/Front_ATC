import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Productos } from "../../shared/model/productos.model";
import { Observable } from 'rxjs';
export interface RespuestaPaginada {
    p: Productos[];
    total: number;
    paginas: number;
    paginaActual: number;
}
@Injectable({
    providedIn: 'root',
})
export class ProductoService {
    private apiUrl = environment.apiurl;
    constructor(private http: HttpClient) { }
    addProducto(p: Productos) {
        return this.http.post(`${this.apiUrl}/productos`, p);
    }
    updateProducto(id: number, p: Productos) {
        return this.http.put(`${this.apiUrl}/productos/${id}`, p);
    }
    deleteProducto(id: number) {
        return this.http.delete(`${this.apiUrl}/productos/${id}`);
    }
    activateProducto(id: number) {
        return this.http.put(`${this.apiUrl}/productos/${id}/activar/`, {});
    }
    getProducto(id: number) {
        return this.http.get<Productos>(`${this.apiUrl}/productos/${id}`);
    }
    getProductos(pagina: number = 1, limite: number = 7): Observable<RespuestaPaginada> {
        const params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/productos`, { params });
    }
    buscarProductos(busqueda: string = '', estatus: number | null = null, marca: number | null = null, pagina: number = 1,
        limite: number = 7): Observable<RespuestaPaginada> {
        let params = new HttpParams()
            .set('pagina', pagina.toString())
            .set('limite', limite.toString());
        if (busqueda) {
            params = params.set('busqueda', busqueda);
        }
        if (estatus !== null) {
            params = params.set('estatus', estatus.toString());
        }
        if (marca !== null) {
            params = params.set('marca', marca.toString());
        }
        return this.http.get<RespuestaPaginada>(`${this.apiUrl}/productos/buscar`, { params });
    }
    buscarProductoCodigo(codigo: string) {
  return this.http.get<any>(`${this.apiUrl}/productos/codigo?termino=${codigo}`);
}
    entradaProducto(codigo: string, cantidad: number, destino: string, id_asesor: number) {
        const payload = {
            codigo: codigo,
            cantidad: cantidad,
            destino: destino,
            id_asesor: id_asesor
        };
        
        return this.http.post(`${this.apiUrl}/productos/entrada`, payload);
    }
    cantidadProductosStock() {
        return this.http.get(`${this.apiUrl}/productos/count`);
    }
} 