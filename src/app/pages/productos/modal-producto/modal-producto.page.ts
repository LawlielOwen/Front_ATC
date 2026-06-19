import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { ProductoService } from "../../../core/services/Productos.service";
import { Productos } from '../../../shared/model/productos.model';
@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.page.html',
  styleUrls: ['./modal-producto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgxSonnerToaster,
    FooterModalComponent,
    HeaderModalComponent,
    ButtonActionComponent,
    InputComponent,
    SelectComponent,
    CardFormComponent
  ]
})
export class ModalProductoPage implements OnInit {
  isEditMode: boolean = false;

  productoNuevo = {
    id: 0,
    Nombre: '',
    Descripcion: '',
    Precio: null as any,
    Codigo_numeral: '',
    Codigo_japon: '',
    Modelo: '',
    Estanteria: '',
    Caja: '',
    Stock: null as any,
    id_marca: null as any
  };

  opcionesMarcas = [
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

  constructor(
    private ps: ProductoService,
    private dialogRef: MatDialogRef<ModalProductoPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.producto) {
      this.isEditMode = true;
      this.productoNuevo = { ...this.data.producto };
    }
  }
  cerrar() {
    this.dialogRef.close(false)
  }
  ngOnInit() {
  }
  procesarAccion() {
    if (!this.productoNuevo.Nombre || !this.productoNuevo.Precio || !this.productoNuevo.Estanteria || !this.productoNuevo.id_marca) {
      toast.error('Por favor, completa los campos requeridos (Nombre, Precio, Marca, Estantería).');
      return;
    }

    if (this.isEditMode) {
      this.actualizarProducto();
    } else {
      this.guardarNuevoProducto();
    }
  }
  private guardarNuevoProducto() {
    this.ps.addProducto(this.productoNuevo as Productos).subscribe({
      next: (res) => {
        toast.success('Producto registrado correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al guardar el producto', err);
        toast.error('Ocurrió un error al intentar registrar el producto.');
      }
    });
  }
  actualizarProducto() {
    const idProducto = this.productoNuevo.id;
    this.ps.updateProducto(idProducto, this.productoNuevo as any).subscribe({
      next: (response) => {
        toast.success('Producto actualizado correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        toast.error('Error al actualizar el producto');
      }
    });
    this.dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true);
      }
    });
  }
}
