import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface FilterOption {
  label: string;
  value: any;   
}
@Component({
  selector: 'app-filtro-dinamico',
  templateUrl: './filtro-dinamico.component.html',
  styleUrls: ['./filtro-dinamico.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FiltroDinamicoComponent  implements OnInit {
  isDropdownOpen: boolean = false;
@Input() placeholder: string = 'Seleccionar...';
  @Input() options: FilterOption[] = [];
  
  @Output() onFilterChange = new EventEmitter<any>();
  opcionSeleccionada: string | null = null;
  constructor() { }

  ngOnInit() {}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }


opcionesMovimiento = [
  { label: 'Entradas y Salidas', value: 'ambos' },
  { label: 'Solo Entradas', value: 'entrada' },
  { label: 'Solo Salidas', value: 'salida' }
];
seleccionarOpcion(opcion: FilterOption) {
    this.opcionSeleccionada = opcion.label;
    this.isDropdownOpen = false;
    this.onFilterChange.emit(opcion.value); 
  }
}
