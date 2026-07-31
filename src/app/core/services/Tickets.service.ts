import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Ticket } from "../../shared/model/tickets.model";
import { Observable } from 'rxjs';

export interface RespuestaPaginada {
    tickets: Ticket[];
    total: number;
    paginas?: number;
    paginaActual?: number;
}

@Injectable({
    providedIn: 'root',
})
export class TicketService {
    private apiUrl = environment.apiurl;

    constructor(private http: HttpClient) { }


  buscarTickets(busqueda: string, estatus: number, idAsesor: number, pagina: number, limite: number) {
    
    let params = new HttpParams()
      .set('busqueda', busqueda)
      .set('estatus', estatus.toString())
      .set('idAsesor', idAsesor.toString())
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    return this.http.get(`${this.apiUrl}/tickets`, { params });
  }


    crearTicket(ticket: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/tickets`, ticket);
    }


    modificarTicket(idTicket: number, ticket: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/tickets/${idTicket}`, ticket);
    }

    cambiarEstatus(idTicket: number, nuevoEstatus: number): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/tickets/${idTicket}/estatus`, { 
            nuevo_estatus: nuevoEstatus 
        });
    }

    cerrarTicket(idTicket: number, ventaExitosa: number, clienteRegistrado: number, nuevoIdCliente: number | null = null): Observable<any> {
        const payload = {
            venta_exitosa: ventaExitosa,
            cliente_registrado: clienteRegistrado,
            nuevo_id_cliente: nuevoIdCliente
        };
        return this.http.patch<any>(`${this.apiUrl}/tickets/${idTicket}/cerrar`, payload);
    }
    contarTicketsAnual(): Observable<{ total: number }> {
        return this.http.get<{ total: number }>(`${this.apiUrl}/tickets/anual`);
    }
}