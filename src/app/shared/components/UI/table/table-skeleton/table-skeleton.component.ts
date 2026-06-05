import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-skeleton.component.html'
})
export class TableSkeletonComponent {
  // Por defecto mostrará 5 filas de "carga", pero puedes cambiarlo al llamarlo: <app-table-skeleton [rows]="8"></app-table-skeleton>
  @Input() rows: number = 5;

  // Genera un arreglo del tamaño indicado para poder usar *ngFor en el HTML
  get rowsArray() {
    return new Array(this.rows);
  }
}