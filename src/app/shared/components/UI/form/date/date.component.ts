import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class DateComponent {
  // Entradas que el componente padre puede personalizar
  @Input() label: string = 'Fecha';
  @Input() placeholder: string = 'dd/mm/yyyy';
  @Input() value: any = null; // Guarda la fecha seleccionada
  @Input() min: any = null;   // Opcional: Fecha mínima seleccionable
  @Input() max: any = null;   // Opcional: Fecha máxima seleccionable

  // Salida para emitir los cambios de vuelta al componente padre (Two-way binding)
  @Output() valueChange = new EventEmitter<any>();

  constructor() { }

  // Método que se ejecuta cuando el usuario selecciona una fecha
  onDateChange(nuevaFecha: any) {
    this.value = nuevaFecha;
    this.valueChange.emit(this.value);
  }
}