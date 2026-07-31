import { Component, Input, Output, EventEmitter, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MenuCoordinatorService } from '../../../../../core/services/menu-coordinator.service';

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
export class MenuOpcionesComponent implements OnDestroy {
  @Input() opcionesExtra: MenuOption[] = [];
  @Output() accionSeleccionada = new EventEmitter<string>();
  @Input() omitirBase: boolean = false;
  @Input() filaDatos: any = null;

  // Se conserva por compatibilidad con lo que ya le pasas desde table.component.html,
  // pero ya no se usa para decidir la dirección: ahora se calcula en tiempo real.
  @Input() abrirHaciaArriba: boolean = false;

  menuAbierto = false;
  posicionMenu: { top?: string; bottom?: string; left?: string } = {};

  private readonly idMenu = `menu-${Math.random().toString(36).slice(2)}`;
  private subCoordinador!: Subscription;
  private cerrarPorScrollBind = () => this.cerrarMenu();

  opcionesBase: MenuOption[] = [
    { accion: 'editar', etiqueta: 'Modificar', claseColor: 'texto-azul' },
    { accion: 'eliminar', etiqueta: 'Eliminar', claseColor: 'texto-rojo' }
  ];

  constructor(private eRef: ElementRef, private coordinador: MenuCoordinatorService) {
    this.subCoordinador = this.coordinador.cambios$.subscribe((idAbierto) => {
      if (idAbierto !== this.idMenu) {
        this.menuAbierto = false;
      }
    });
  }

  get opciones(): MenuOption[] {
    const lista = this.omitirBase ? this.opcionesExtra : [...this.opcionesBase, ...this.opcionesExtra];

    return lista.filter(op => {
      if (op.mostrarSi && this.filaDatos) {
        return op.mostrarSi(this.filaDatos);
      }
      return true;
    });
  }

  toggleMenu(event: Event) {
    event.stopPropagation();

    if (this.menuAbierto) {
      this.cerrarMenu();
      return;
    }

    const boton = event.currentTarget as HTMLElement;
    this.calcularPosicion(boton);
    this.coordinador.abrir(this.idMenu);
    this.menuAbierto = true;
    document.addEventListener('scroll', this.cerrarPorScrollBind, true);
  }

  private calcularPosicion(boton: HTMLElement) {
    const rect = boton.getBoundingClientRect();
    const anchoMenu = 176; // w-44 = 11rem
    const altoEstimado = this.opciones.length * 42 + 16;

    const espacioAbajo = window.innerHeight - rect.bottom;
    const abrirArriba = espacioAbajo < altoEstimado && rect.top > altoEstimado;

    let left = rect.right - anchoMenu;
    left = Math.max(8, Math.min(left, window.innerWidth - anchoMenu - 8));

    this.posicionMenu = abrirArriba
      ? { bottom: `${window.innerHeight - rect.top + 8}px`, left: `${left}px` }
      : { top: `${rect.bottom + 8}px`, left: `${left}px` };
  }

  private cerrarMenu() {
    this.menuAbierto = false;
    document.removeEventListener('scroll', this.cerrarPorScrollBind, true);
  }

  ejecutarAccion(accion: string) {
    this.accionSeleccionada.emit(accion);
    this.cerrarMenu();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.menuAbierto && !this.eRef.nativeElement.contains(event.target)) {
      this.cerrarMenu();
    }
  }

  ngOnDestroy() {
    this.subCoordinador?.unsubscribe();
    document.removeEventListener('scroll', this.cerrarPorScrollBind, true);
  }
}