import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-filtro-fecha',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule,MatFormFieldModule,MatDatepickerModule,MatNativeDateModule],
  templateUrl: './filtro-fecha.component.html'
})
export class FiltroFechaComponent implements OnInit {
  @Output() onFilterChange = new EventEmitter<{inicio: string, fin: string}>();
 fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  fechaMax: Date = new Date();

  ngOnInit() {
    const hoy = new Date();
  this.fechaMax = hoy; 
    this.fechaInicio = hoy; 
    this.fechaFin = hoy;   
  }

  aplicarFiltro() {
    if (this.fechaInicio && this.fechaFin) {
      // 3. Formateamos las fechas a texto JUSTO antes de emitirlas
      this.onFilterChange.emit({
        inicio: this.formatearFechaLocal(this.fechaInicio),
        fin: this.formatearFechaLocal(this.fechaFin)
      });
    }
  }
  formatearFechaLocal(fecha: Date): string {
    const d = new Date(fecha);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0'); 
    const anio = d.getFullYear();
    
    return `${anio}-${mes}-${dia}`;
  }
}