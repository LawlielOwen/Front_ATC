import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuOption, MenuOpcionesComponent } from './options/options.component';
export interface TableColumn {
  header: string;
  key: string;
  subKey?: string;
  type: 'text' | 'currency' | 'status' | 'avatar-text' | 'actions' | 'stock' | 'pill-tipo' | 'pill-destino' | 'text-light' | 'cantidad-movimiento' | 'link';
  align?: 'left' | 'center' | 'right';
  menuOptions?: MenuOption[];
  omitirBase?: boolean;
}
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [CommonModule, MenuOpcionesComponent]
})
export class TableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Output() actionClick = new EventEmitter<{ accion: string, row: any }>();
  @Output() rowClick = new EventEmitter<any>();
  constructor() { }

  ngOnInit() { }
getStatusColors(status: string) {
    if (!status) return 'bg-slate-50 text-slate-600 border-slate-200';
    
    // Normalizamos el texto: minúsculas y sin acentos para evitar errores de tipeo
    const s = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // --- Productos ---
    if (s === 'activo') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'sin stock') return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';

    // --- Almacén ---
    if (s === 'recibido') return 'bg-[#e8f5f0] text-[#0f6e56] border-[#bce3d4]'; 
    if (s === 'con incidencia') return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'; 

    // --- Cotizaciones ---
    if (s === 'aceptada' || s === 'aceptado') return 'bg-blue-50 text-blue-700 border-blue-200'; 
    
    // --- Pedidos ---
    if (s === 'incompleto' || s === 'incompleta') return 'bg-amber-50 text-amber-700 border-amber-200'; 

    // --- Tickets ---
    if (s === 'asignado') return 'bg-violet-50 text-violet-700 border-violet-200'; 
    if (s === 'contactado') return 'bg-sky-50 text-sky-700 border-sky-200'; 
    if (s === 'cotizado') return 'bg-amber-50 text-amber-700 border-amber-200'; 
    if (s === 'cerrado') return 'bg-slate-200 text-slate-700 border-slate-300'; 

    // --- Proyectos ---
    if (s === 'en progreso') return 'bg-blue-50 text-[#003B8A] border-blue-200'; // Azul corporativo ATC
    if (s === 'revision cliente') return 'bg-indigo-50 text-indigo-700 border-indigo-200'; // Índigo para revisión
    if (s === 'ejecucion') return 'bg-cyan-50 text-cyan-700 border-cyan-200'; // Cian para proceso activo
    if (s === 'en pausa') return 'bg-amber-50 text-amber-700 border-amber-200'; // Ámbar alerta
    
    // --- Compartidos (Cancelado, Completado, Pendiente) ---
    if (s === 'completado' || s === 'completada') return 'bg-[#e8f5f0] text-[#1D9E75] border-[#bce3d4]'; // Verde ATC
    if (s === 'cancelada' || s === 'cancelado') return 'bg-rose-50 text-rose-700 border-rose-200'; // Rojo
    if (s === 'pendiente') return 'bg-slate-50 text-slate-600 border-slate-200'; 
    
    return 'bg-slate-50 text-slate-600 border-slate-200'; 
}

getStatusDot(status: string) {
    if (!status) return 'bg-slate-400';
    
    const s = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // --- Productos ---
    if (s === 'activo') return 'bg-emerald-500';
    if (s === 'sin stock') return 'bg-rose-500';

    // --- Almacén ---
    if (s === 'recibido') return 'bg-[#1D9E75]'; 
    if (s === 'con incidencia') return 'bg-rose-600'; 
    
    // --- Cotizaciones ---
    if (s === 'aceptada' || s === 'aceptado') return 'bg-blue-500';

    // --- Pedidos ---
    if (s === 'incompleto' || s === 'incompleta') return 'bg-amber-500'; 

    // --- Tickets ---
    if (s === 'asignado') return 'bg-violet-500';
    if (s === 'contactado') return 'bg-sky-500'; 
    if (s === 'cotizado') return 'bg-amber-500'; 
    if (s === 'cerrado') return 'bg-slate-500'; 

    // --- Proyectos ---
    if (s === 'en progreso') return 'bg-[#003B8A]'; 
    if (s === 'revision cliente') return 'bg-indigo-500';
    if (s === 'ejecucion') return 'bg-cyan-500';
    if (s === 'en pausa') return 'bg-amber-500';

    // --- Compartidos ---
    if (s === 'completado' || s === 'completada') return 'bg-[#1D9E75]';
    if (s === 'cancelada' || s === 'cancelado') return 'bg-rose-600';
    if (s === 'pendiente') return 'bg-slate-400'; 

    return 'bg-slate-400';
}
  getStockColor(cantidad: number): string {
    if (cantidad === 0) return 'text-rose-600';
    if (cantidad > 0 && cantidad <= 5) return 'text-amber-500';
    return 'text-emerald-600';
  }
  emitirClicFila(row: any) {
    console.log('1. Clic detectado dentro de la tabla. Producto:', row.Nombre);
    this.rowClick.emit(row);
  }
  manejarAccionMenu(accion: string, row: any) {
    this.actionClick.emit({ accion, row });
  }
}
