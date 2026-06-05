import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuOption, MenuOpcionesComponent } from './options/options.component';
export interface TableColumn {
  header: string;
  key: string;
  subKey?: string;
  type: 'text' | 'currency' | 'status' | 'avatar-text' | 'actions' | 'stock' | 'pill-tipo' | 'pill-destino' | 'text-light' | 'cantidad-movimiento';
  align?: 'left' | 'center' | 'right';
  menuOptions?: MenuOption[];
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
    const s = status.toLowerCase();
    if (s === 'activo') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'sin stock') return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    return 'bg-slate-50 text-slate-600 border-slate-200'; // Inactivo o por defecto
  }
  getStatusDot(status: string) {
    const s = status.toLowerCase();
    if (s === 'activo') return 'bg-emerald-500';
    if (s === 'sin stock') return 'bg-rose-500';
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
