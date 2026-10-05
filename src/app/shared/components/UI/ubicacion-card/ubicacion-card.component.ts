import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ubicacion } from '../../../model/productos.model';

export type TipoUbicacion = 'estanteria' | 'caja';

@Component({
  selector: 'app-ubicacion-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ubicacion-card.component.html',
})
export class UbicacionCardComponent {
  @Input({ required: true }) ubicacion!: Ubicacion;
  @Input() tipo: TipoUbicacion = 'estanteria';
  @Output() cambiarEstatus = new EventEmitter<Ubicacion>();

  get activo(): boolean {
    return (this.ubicacion.estatus ?? 1) === 1;
  }

  get acento(): string {
    return this.tipo === 'estanteria' ? '#1d4ed8' : '#1D9E75';
  }

  get fondoIcono(): string {
    return this.tipo === 'estanteria' ? '#dbeafe' : '#E1F5EE';
  }
}