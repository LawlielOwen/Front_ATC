import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface MenuOption {
  accion: string;      
  etiqueta: string;   
  claseColor?: string;
  mostrarSi?: (row: any) => boolean;
}
@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  standalone: true, 
  imports: [CommonModule]
})

export class MenuOpcionesComponent {
  @Input() opcionesExtra: MenuOption[] = [];
  @Output() accionSeleccionada = new EventEmitter<string>();
@Input() omitirBase: boolean = false; 
 menuAbierto = false;
@Input() abrirHaciaArriba: boolean = false;
@Input() filaDatos: any = null;
  opcionesBase: MenuOption[] = [
    { accion: 'editar', etiqueta: 'Modificar', claseColor: 'texto-azul' },
    { accion: 'eliminar', etiqueta: 'Eliminar', claseColor: 'texto-rojo' }
  ];

  constructor(private eRef: ElementRef) {}

get opciones(): MenuOption[] {
    const lista = this.omitirBase ? this.opcionesExtra : [...this.opcionesBase, ...this.opcionesExtra];
    
    // NUEVO: Filtramos la lista evaluando la condición de cada opción
    return lista.filter(op => {
      // Si la opción tiene la función 'mostrarSi' y tenemos los datos de la fila, la evaluamos
      if (op.mostrarSi && this.filaDatos) {
        return op.mostrarSi(this.filaDatos);
      }
      // Si no tiene condición especial, se muestra siempre
      return true; 
    });
  }

  toggleMenu(event: Event) {
    event.stopPropagation(); 
    this.menuAbierto = !this.menuAbierto;
  }

  ejecutarAccion(accion: string) {
    this.accionSeleccionada.emit(accion);
    this.menuAbierto = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuAbierto = false;
    }
  }
}
