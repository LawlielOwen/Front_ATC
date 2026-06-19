import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CardOption {
  value: string | number;
  titulo: string;         
  descripcion?: string;  
}

@Component({
  selector: 'app-card-option',
  templateUrl: './card-option.component.html',
  styleUrls: ['./card-option.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CardSelectComponent {
  @Input() label: string = 'Selecciona una opción';
  
  @Input() opciones: CardOption[] = [];
  
  @Input() value: any = null;
  
  @Output() valueChange = new EventEmitter<any>();

  constructor() {}

  seleccionar(nuevoValor: any) {
    this.value = nuevoValor;
    this.valueChange.emit(this.value);
  }
}