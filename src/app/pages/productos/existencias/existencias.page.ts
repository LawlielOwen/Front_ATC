import { Component, OnInit, Inject } from '@angular/core';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { StepItemComponent} from "../../../shared/components/UI/modal/step-item/step-item.component";
import { CardSelectComponent, CardOption } from "../../../shared/components/UI/modal/card-option/card-option.component";
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { ProductoService } from '../../../core/services/Productos.service'
import { toast } from 'ngx-sonner';
import { NgxSonnerToaster } from 'ngx-sonner';
import { MovimientoService } from '../../../core/services/Movimientos.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-existencias',
  templateUrl: './existencias.page.html',
  styleUrls: ['./existencias.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HeaderModalComponent,
    FooterModalComponent,
    ButtonActionComponent,
    NgxSonnerToaster,
    StepItemComponent,
    CardSelectComponent
  ]
})
export class ExistenciasPage implements OnInit {

  productoEncontrado: any = null;
  paso: number = 1;
  cantidad: number = 0;
  destino: 'almacen' | 'pedido' = 'almacen';
  tipoMovimiento: 'Entrada' | 'Salida' = 'Entrada';
  constructor(private dialogRef: MatDialogRef<ExistenciasPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, private ps: ProductoService, private ms: MovimientoService) {
  if (this.data && this.data.tipo) {
      this.tipoMovimiento = this.data.tipo;
      if (this.tipoMovimiento === 'Salida') {
        this.destino = 'pedido';
      }
    }
  }
  producto = {
    codigo: '',
    cantidad: null as any
  }
  ngOnInit() {
  }
  get esEntrada() { return this.tipoMovimiento === 'Entrada'; }
  get colorHex() { return this.esEntrada ? '#1D9E75' : '#b91c1c'; } 
  get bgClass() { return this.esEntrada ? 'bg-[#1D9E75]' : 'bg-[#b91c1c]'; }
  get hoverClass() { return this.esEntrada ? 'hover:bg-[#15805d]' : 'hover:bg-[#991b1b]'; }
  get tituloModal() { return this.esEntrada ? 'Agregar existencias' : 'Registrar Salida'; }
  get nuevoStock() { 
    return this.esEntrada 
      ? this.productoEncontrado.Stock + this.cantidad 
      : this.productoEncontrado.Stock - this.cantidad; 
  }
  avanzarPaso() {
    this.paso = 2;
  }

  retrocederPaso() {
    this.paso = 1;
    this.cantidad = 1;
  }
  cerrar() {
    this.dialogRef.close();
  }
  confirmarEntrada() {
    const codigoP = this.productoEncontrado.Codigo_japon || this.productoEncontrado.Codigo_numeral;
    const usuarioString = localStorage.getItem('user');
    let idAsesor = null;

    if (usuarioString) {
      const usuarioObj = JSON.parse(usuarioString);
      idAsesor = usuarioObj.id;
    }
    this.ps.entradaProducto(codigoP, this.cantidad, this.destino, idAsesor).subscribe({
      next: (response) => {
        this.paso = 3;
        toast.success('Entrada registrada correctamente');
      },
      error: (err) => {
        console.error(err);
        toast.error('Ocurrió un error al registrar la entrada');
      }
    });
    this.dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true);
      }
    });
  }
confirmarMovimiento() {
    if (!this.esEntrada && this.cantidad > this.productoEncontrado.Stock) {
      toast.error('No hay suficiente stock para esta salida');
      return;
    }

    const codigoP = this.productoEncontrado.Codigo_japon || this.productoEncontrado.Codigo_numeral;
    const usuarioString = localStorage.getItem('user');
    let idAsesor = usuarioString ? JSON.parse(usuarioString).id : null;

    if (this.esEntrada) {
      this.ps.entradaProducto(codigoP, this.cantidad, this.destino, idAsesor).subscribe({
        next: () => {
          this.paso = 3;
          toast.success('Entrada registrada correctamente');
        },
        error: (err) => { console.error(err); toast.error('Error al registrar la entrada'); }
      });
    } else {
      this.ms.salidaProducto(codigoP, this.cantidad, this.destino, idAsesor).subscribe({
        next: () => {
          this.paso = 3;
          toast.success('Salida registrada correctamente');
        },
        error: (err) => { console.error(err); toast.error('Error al registrar la salida'); }
      });
    }
  }
  finalizar() {
    this.dialogRef.close(true);
  }
  consultarProducto() {
    const codigoP = this.producto.codigo;

    if (!codigoP) return;

    this.ps.buscarProductoCodigo(codigoP).subscribe({
      next: (response: any) => {
        this.productoEncontrado = response;
      },
      error: (err) => {
        console.error('Producto no encontrado', err);
        this.productoEncontrado = null;
        toast.error("Producto no encontrado");
      }
    });
  }
  // Transformamos el arreglo estático en un 'get' dinámico
  get opcionesDestino(): CardOption[] {
    // La opción 'pedido' siempre existe, así que la ponemos por defecto
    const opciones: CardOption[] = [
      { value: 'pedido', titulo: 'Para pedido', descripcion: 'Suministra un pedido' }
    ];

    // Simulamos tu *ngIf: Si es entrada, agregamos 'almacen' al principio de la lista
    if (this.esEntrada) {
      opciones.unshift({ value: 'almacen', titulo: 'Para almacén', descripcion: 'Se suma al stock general' });
    }

    return opciones;
  }
}
