import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MetricaService {
  private apiUrl = environment.apiurl;

  constructor(private http: HttpClient) { }
// 1. Productos más vendidos (Top 5)
getProductosTop(meses: number = 3): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/metricas/top-productos`, {
    params: { meses: meses.toString() }
  });
}

// 2. Productos menos vendidos (Bottom 5)
getProductosMenosVendidos(meses: number = 3): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/metricas/bottom-productos`, {
    params: { meses: meses.toString() }
  });
}
  // 3. Tasa de conversión (Cotizado vs Vendido)
getTasaConversion(moneda: string = 'GLOBAL', idCliente?: number | null): Observable<any[]> {
    const url = idCliente 
      ? `${this.apiUrl}/metricas/tasa-conversion?moneda=${moneda}&id_cliente=${idCliente}`
      : `${this.apiUrl}/metricas/tasa-conversion?moneda=${moneda}`;
    return this.http.get<any[]>(url);
  }

  // 4. Producto Estrella por Cliente (Top 5 para el Dashboard)
getProductosEstrella(idCliente?: number | null): Observable<any[]> {
    const url = idCliente 
      ? `${this.apiUrl}/metricas/productos-estrella?id_cliente=${idCliente}`
      : `${this.apiUrl}/metricas/productos-estrella`;
      
    return this.http.get<any[]>(url);
  }
 getTendenciaCotizaciones(moneda: string = 'GLOBAL', fechaInicio?: string | null, fechaFin?: string | null): Observable<any[]> {
    let url = `${this.apiUrl}/metricas/tendencia-cotizaciones?moneda=${moneda}`;
    
    if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    if (fechaFin) url += `&fecha_fin=${fechaFin}`;
    
    return this.http.get<any[]>(url);
  }
  getEstadisticasGenerales(): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/metricas/estadisticas-generales`);
  }
}