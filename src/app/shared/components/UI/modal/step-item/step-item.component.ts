import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  numero: number;
  etiqueta: string;
}
@Component({
  selector: 'app-step-item',
  templateUrl: './step-item.component.html',
  styleUrls: ['./step-item.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StepItemComponent {

  @Input() pasoActual: number = 1;
  
  @Input() pasos: StepItem[] = [
    { numero: 1, etiqueta: 'Código Japón' },
    { numero: 2, etiqueta: 'Cantidad' },
    { numero: 3, etiqueta: 'Confirmar' }
  ];

  constructor() {}

  get progreso(): string {
    const max = this.pasos.length - 1;
    const actual = this.pasoActual - 1;
    const porcentaje = (actual / max) * 100;
    
    return `${porcentaje > 100 ? 100 : porcentaje}%`;
  }
}
