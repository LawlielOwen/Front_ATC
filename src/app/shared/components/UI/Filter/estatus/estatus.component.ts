import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OpcionEstatus {
  label: string;
  value: number | null;
}
@Component({
  selector: 'app-estatus',
  templateUrl: './estatus.component.html',
  styleUrls: ['./estatus.component.scss'],
 standalone: true,
  imports: [CommonModule]
})
export class EstatusComponent implements OnInit {
  isDropdownOpen: boolean = false;
  estatusSeleccionado: string = 'Todos';
  @Output() onFilterChange = new EventEmitter<number | null>();

  constructor() { }

  ngOnInit() {
    if (this.opciones && this.opciones.length > 0) {
      this.estatusSeleccionado = this.opciones[0].label;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
@Input() opciones: OpcionEstatus[] = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: 1 },
    { label: 'Inactivos', value: 0 }
  ];
 seleccionarEstatus(opcion: OpcionEstatus) {
    this.estatusSeleccionado = opcion.label;
    this.isDropdownOpen = false;
    this.onFilterChange.emit(opcion.value);
  }
}