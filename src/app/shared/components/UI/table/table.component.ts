import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuOption, MenuOpcionesComponent } from './options/options.component';
export interface TableColumn {
  header: string;
  key: string;
  subKey?: string;
  type: 'text' | 'currency' | 'status' | 'avatar-text' | 'actions' | 'stock' | 'pill-tipo' | 'pill-destino' | 'text-light' | 'cantidad-movimiento' | 'link' | 'count';
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
   if (!status) return 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm';
    const s = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // --- Productos ---
    if (s === 'activo') return 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm';
    if (s === 'sin stock') return 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm animate-pulse';
if (s === 'inactivo') return 'bg-red-100 text-red-700 border-red-400 shadow-sm font-bold';
    // --- Almacén ---
    if (s === 'recibido') return 'bg-[#d1fae5] text-[#065f46] border-[#6ee7b7] shadow-sm'; // Verde ATC más intenso
    if (s === 'con incidencia') return 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm animate-pulse'; 

    // --- Cotizaciones ---
    if (s === 'aceptada' || s === 'aceptado') return 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm'; 
    
    // --- Pedidos ---
    if (s === 'incompleto' || s === 'incompleta') return 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'; 

    // --- Tickets ---
    if (s === 'asignado') return 'bg-violet-100 text-violet-800 border-violet-300 shadow-sm'; 
    if (s === 'contactado') return 'bg-sky-100 text-sky-800 border-sky-300 shadow-sm'; 
    if (s === 'cotizado') return 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'; 
    if (s === 'cerrado') return 'bg-slate-200 text-slate-800 border-slate-400 shadow-sm'; 

    // --- Proyectos ---
    if (s === 'en progreso') return 'bg-blue-100 text-[#003B8A] border-blue-300 shadow-sm'; 
    if (s === 'revision cliente') return 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-sm'; 
    if (s === 'ejecucion') return 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-sm'; 
    if (s === 'en pausa') return 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'; 
    
    // --- Compartidos (Cancelado, Completado, Pendiente) ---
    if (s === 'completado' || s === 'completada') return 'bg-[#d1fae5] text-[#065f46] border-[#6ee7b7] shadow-sm'; 
    if (s === 'cancelada' || s === 'cancelado') return 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm'; 
    if (s === 'pendiente') return 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm'; 
    
    return 'bg-slate-100 text-slate-700 border-slate-300 shadow-sm'; 
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
     
    if (s === 'inactivo') return 'bg-rose-600'; 

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
  getCountColor(cantidad: number): string {
    if (!cantidad || cantidad === 0) return 'text-slate-400';
    return 'text-[#003B8A]';
}
}
