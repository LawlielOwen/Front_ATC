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
opcionesMarcas = [
  { label: 'Todas las marcas', value: null },
  { label: 'SMC', value: 1 },
  { label: 'OMRON', value: 2 },
  { label: 'PATLITE', value: 3 },
  { label: 'WAGO', value: 4 },
  { label: 'RWV', value: 5 },
  { label: 'KLINGSPOR', value: 6 },
  { label: 'KING TONY', value: 7 },
  { label: 'Mighty Seven (m7)', value: 8 },
  { label: 'Fuji Electric', value: 9 }
];

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
