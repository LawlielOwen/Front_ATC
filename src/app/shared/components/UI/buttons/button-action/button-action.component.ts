import { Component, OnInit, Input, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-button-action',
  templateUrl: './button-action.component.html',
  styleUrls: ['./button-action.component.scss'],
  imports: [CommonModule, IonicModule],
})
export class ButtonActionComponent implements OnInit {

  @Input() label: string = '';
  @Input() claseCss: string = 'btn-cerrar';
  @Input() expandir: string | undefined = undefined; 
  @Input() esEliminar: boolean = false; 
  @Input() estatus: number | undefined = undefined;
  @Input() disabled: boolean = false;

  // Variable interna para el bloqueo temporal automático
  autoDisabled: boolean = false;

  // ESTO ES CLAVE: Corta de raíz cualquier clic adicional a nivel de navegador.
  // Si está deshabilitado (ya sea por el padre o automáticamente), el mouse lo ignora.
  @HostBinding('style.pointer-events') get pointerEvents() {
    return (this.disabled || this.autoDisabled) ? 'none' : 'auto';
  }

  constructor() { }

  ngOnInit() {}

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (this.disabled || this.autoDisabled) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    if (this.claseCss === 'btn-agregar') {
      this.autoDisabled = true;
      setTimeout(() => {
        this.autoDisabled = false;
      }, 3000);
    }
  }
}