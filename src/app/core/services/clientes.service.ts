import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente } from "../../shared/model/clientes.model";
import { Observable } from 'rxjs';
export interface RespuestaPaginada {
  clientes: Cliente[];
  total: number;
  paginas: number;
  paginaActual: number;
}
@Injectable({
  providedIn: 'root',
})

export class ClientesService {
  private apiUrl = environment.apiurl;
  private clientes: Cliente[] = [];

  constructor(private http: HttpClient) { }

  addCliente(datos: FormData) {

    return this.http.post(`${this.apiUrl}/clientes`, datos);
  }
  updateCliente(id: number, cliente: Cliente) {
    return this.http.put(`${this.apiUrl}/clientes/${id}`, cliente);
  }
  deleteCliente(id: number) {
    return this.http.delete(`${this.apiUrl}/clientes/${id}`);
  }
  activateCliente(id: number) {
    return this.http.put(`${this.apiUrl}/clientes/${id}/activar/`, {});
  }
  getCliente(id: number) {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/${id}`);
  }

  getClientes(pagina: number = 1, limite: number = 6): Observable<RespuestaPaginada> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());
    return this.http.get<RespuestaPaginada>(`${this.apiUrl}/clientes`, { params });
  }
  buscarClientes(nombre: string = '', estatus: number | null = null, pagina: number = 1, limite: number = 6): Observable<RespuestaPaginada> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());
    if (nombre) {
      params = params.set('busqueda', nombre);
    }
    if (estatus !== null) {
      params = params.set('estatus', estatus.toString());
    }
    return this.http.get<RespuestaPaginada>(`${this.apiUrl}/clientes/buscar`, { params });
  }
  procesarCSF(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post(`${this.apiUrl}/clientes/procesar-csf`, formData);
  }
  obtenerUrlArchivo(rutaConstancia: string): string {
    const rutaFormateada = rutaConstancia.replace(/\\/g, '/');
    const baseUrl = this.apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/${rutaFormateada}`;
  }
  cantidadClientesActivos() {
    return this.http.get(`${this.apiUrl}/clientes/count`);
  }
}