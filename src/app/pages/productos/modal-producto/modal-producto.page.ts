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
import { AuthService } from '../../../core/services/auth.service';

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
    ExtraDescripcion: '',
    Precio: null as any,
    Codigo_numeral: '',
    Codigo_japon: '',
    Estanteria: '',
    Caja: '',
    Stock: null as any,
    Apartado: null as any,
    origen:'',
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
    { label: 'Fuji Electric', value: 9 },
    { label: 'Sumitomo Drive Technologies', value: 10 },
    { label: 'Wenglor', value: 11 },
    { label: 'PHOENIX CONTACT', value: 12 },
    { label: 'PILZ', value: 13 },
    { label: 'EUCHNER', value: 14 },
    { label: 'CONTRINEX', value: 15 }
  ];
esSMC: boolean = false;
  constructor(
    private ps: ProductoService,
    private dialogRef: MatDialogRef<ModalProductoPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,public authService: AuthService
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
    if (!this.validarCampos()) {
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
  }
validarCampos(): boolean {
    this.productoNuevo.Nombre = (this.productoNuevo.Nombre || '').toString().trim();
    this.productoNuevo.Descripcion = (this.productoNuevo.Descripcion || '').toString().trim();
    this.productoNuevo.Codigo_numeral = (this.productoNuevo.Codigo_numeral || '').toString().trim();
    this.productoNuevo.Codigo_japon = (this.productoNuevo.Codigo_japon || '').toString().trim();
    this.productoNuevo.Estanteria = (this.productoNuevo.Estanteria || '').toString().trim();
    this.productoNuevo.Caja = (this.productoNuevo.Caja || '').toString().trim();

    this.productoNuevo.ExtraDescripcion = (this.productoNuevo.ExtraDescripcion || '').toString().trim();
    this.productoNuevo.origen = (this.productoNuevo.origen || '').toString().trim();

    if (
      !this.productoNuevo.Nombre ||
      !this.productoNuevo.Descripcion ||
      !this.productoNuevo.Codigo_numeral ||
      !this.productoNuevo.Codigo_japon ||
      !this.productoNuevo.Estanteria ||
      !this.productoNuevo.Caja ||
      !this.productoNuevo.id_marca
    ) {
      toast.error('Por favor, completa todos los campos obligatorios del formulario.');
      return false;
    }

    const precioNumerico = Number(this.productoNuevo.Precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0.');
      return false;
    }
    this.productoNuevo.Precio = precioNumerico; 

    const stockNumerico = Number(this.productoNuevo.Stock);
    if (isNaN(stockNumerico) || !Number.isInteger(stockNumerico) || stockNumerico < 0) {
      toast.error('El stock debe ser un número entero válido (0 o mayor).');
      return false;
    }
    this.productoNuevo.Stock = stockNumerico; 


    if (this.productoNuevo.Apartado === null || this.productoNuevo.Apartado === '' || this.productoNuevo.Apartado === undefined) {
      this.productoNuevo.Apartado = 0;
    } else {
      const apartadoNumerico = Number(this.productoNuevo.Apartado);
      if (isNaN(apartadoNumerico) || !Number.isInteger(apartadoNumerico) || apartadoNumerico < 0) {
        toast.error('El stock en apartado debe ser un número entero válido (0 o mayor).');
        return false;
      }
      this.productoNuevo.Apartado = apartadoNumerico; 
    }

    return true; 
  }
}
