import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-etiqueta',
  templateUrl: './etiqueta.component.html',
  styleUrls: ['./etiqueta.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class EtiquetaComponent {
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() badge: string = ''; 
  
  @Input() tipoBorde: 'rojo' | 'azul' | 'naranja' | 'verde' = 'azul';
  @Input() mostrarCuadro: boolean = false; 
  @Input() mostrarBotones: boolean = false;
  @Input() cargando: boolean = false;
  @Output() aprobar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<void>();

  get borderClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'border-l-red-600';
      case 'azul': return 'border-l-[#003B8A]';
      case 'naranja': return 'border-l-orange-500'; 
      case 'verde': return 'border-l-green-600';
      default: return 'border-l-slate-400';
    }
  }

  get bgIconClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'bg-red-200';
      case 'azul': return 'bg-blue-200';
      case 'naranja': return 'bg-orange-200'; 
      case 'verde': return 'bg-green-200';
      default: return 'bg-slate-200';
    }
  }

  get textIconClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'text-red-700';
      case 'azul': return 'text-[#003B8A]';
      case 'naranja': return 'text-orange-700'; 
      case 'verde': return 'text-green-700';
      default: return 'text-slate-600';
    }
  }

  get cardBgClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'bg-red-50 hover:bg-red-100 transition-colors';
      case 'azul': return 'bg-blue-50 hover:bg-blue-100 transition-colors';
      case 'naranja': return 'bg-orange-50 hover:bg-orange-100 transition-colors'; 
      case 'verde': return 'bg-green-50 hover:bg-green-100 transition-colors';
      default: return 'bg-slate-50 hover:bg-slate-100 transition-colors';
    }
  }

  get badgeClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'text-red-800 bg-red-100 border-red-300 font-semibold';
      case 'verde': return 'text-green-800 bg-green-100 border-green-300 font-semibold';
      case 'naranja': return 'text-orange-800 bg-orange-100 border-orange-300 font-semibold';
      case 'azul': return 'text-blue-800 bg-blue-100 border-blue-300 font-semibold';
      default: return 'text-slate-800 bg-slate-200 border-slate-300 font-semibold';
    }
  }

  getBadgeText(estatus: number): string {
    switch (estatus) {
      case 0: return 'Pendiente';
      case 1: return 'Aceptada';
      case 2: return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  getTipoBorde(estatus: number): 'naranja' | 'verde' | 'rojo' | 'azul' {
    switch (estatus) {
      case 0: return 'naranja';
      case 1: return 'verde';
      case 2: return 'rojo';
      default: return 'azul';
    }
  }
}