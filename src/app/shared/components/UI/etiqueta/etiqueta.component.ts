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

  // Borde lateral
  get borderClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'border-l-[#dc2626]';
      case 'azul': return 'border-l-[#003B8A]';
      case 'naranja': return 'border-l-[#f59e0b]'; // Ámbar puro
      case 'verde': return 'border-l-[#16a34a]';
      default: return 'border-l-slate-300';
    }
  }

  // Cuadro del ícono
  get bgIconClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'bg-red-100';
      case 'azul': return 'bg-blue-100';
      case 'naranja': return 'bg-amber-100'; // Ámbar claro
      case 'verde': return 'bg-green-100';
      default: return 'bg-slate-200';
    }
  }

  // Color del ícono
  get textIconClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'text-red-600';
      case 'azul': return 'text-[#003B8A]';
      case 'naranja': return 'text-amber-600'; // Ámbar fuerte
      case 'verde': return 'text-green-600';
      default: return 'text-slate-500';
    }
  }

  // Fondo de la tarjeta
  get cardBgClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'bg-red-50/50 hover:bg-red-50';
      case 'azul': return 'bg-blue-50/50 hover:bg-blue-50';
      case 'naranja': return 'bg-amber-50/40 hover:bg-amber-50/80'; // Tinte ámbar sutil
      case 'verde': return 'bg-green-50/50 hover:bg-green-50';
      default: return 'bg-slate-50/50 hover:bg-slate-50';
    }
  }

  // NUEVO: Color dinámico para la pastilla (badge)
  get badgeClass() {
    switch (this.tipoBorde) {
      case 'rojo': return 'text-red-700 bg-red-100 border-red-200';
      case 'verde': return 'text-green-700 bg-green-100 border-green-200';
      case 'naranja': return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'azul': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-slate-700 bg-slate-200 border-slate-200';
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

  // Función para traducir el número al color del borde
  getTipoBorde(estatus: number): 'naranja' | 'verde' | 'rojo' | 'azul' {
    switch (estatus) {
      case 0: return 'naranja';
      case 1: return 'verde';
      case 2: return 'rojo';
      default: return 'azul';
    }
  }
}