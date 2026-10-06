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
import { Productos, Estanteria, Caja } from '../../../shared/model/productos.model';
import { AuthService } from '../../../core/services/auth.service';
import { MarcaService } from '../../../core/services/Marcas.service';
import { Marcas } from '../../../shared/model/marcas.model';

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

  productoNuevo: any = {
    id: 0,
    Nombre: '',
    Descripcion: '',
    ExtraDescripcion: '',
    Precio: null,
    Codigo_numeral: '',
    Codigo_japon: '',
    id_estanteria: null,
    Estanteria: '',
    id_caja: null,
    Caja: '',
    Stock: null,
    Apartado: null,
    origen: '',
    id_marca: null
  };

  opcionesMarcas: Marcas[] = [];
  estanterias: Estanteria[] = [];
  cajas: Caja[] = [];

  constructor(
    private ps: ProductoService,
    private dialogRef: MatDialogRef<ModalProductoPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public authService: AuthService,
    private marcaService: MarcaService
  ) {
    if (this.data && this.data.producto) {
      this.isEditMode = true;
    }
  }
cargarProductoEdicion() {
  const id = Number(this.data.producto.id);

  this.ps.getProducto(id).subscribe({
    next: (producto: Productos) => {

      this.productoNuevo = {
        ...this.productoNuevo,
        ...producto,
        id_marca: producto.id_marca
          ? String(producto.id_marca)
          : '',
        id_estanteria: producto.id_estanteria
          ? String(producto.id_estanteria)
          : '',
        id_caja: producto.id_caja
          ? String(producto.id_caja)
          : ''
      };
    },

    error: (err) => {
      console.error('Error al cargar producto', err);
      toast.error('No se pudo cargar la información completa del producto');
    }
  });
}
ngOnInit() {
  this.cargarMarcas();
  this.cargarUbicaciones();

  if (this.isEditMode) {
    this.cargarProductoEdicion();
  }
}

  cerrar() {
    this.dialogRef.close(false);
  }

  cargarMarcas() {
    this.marcaService.getMarcasActivas().subscribe({
      next: (marcas: Marcas[]) => {
        this.opcionesMarcas = marcas;
      },
      error: (err) => {
        console.error('Error al cargar marcas', err);
      }
    });
  }

  cargarUbicaciones() {
    this.ps.obtenerEstanterias().subscribe({
      next: (res) => {
        this.estanterias = res.estanterias || [];
      },
      error: (err) => {
        console.error('Error al cargar estanterías', err);
        toast.error('No se pudieron cargar las estanterías');
      }
    });

    this.ps.obtenerCajas().subscribe({
      next: (res) => {
        this.cajas = res.cajas || [];
      },
      error: (err) => {
        console.error('Error al cargar cajas', err);
        toast.error('No se pudieron cargar las cajas');
      }
    });
  }

  procesarAccion() {
    if (!this.validarCampos()) return;

    if (this.isEditMode) {
      this.actualizarProducto();
    } else {
      this.guardarNuevoProducto();
    }
  }

  private guardarNuevoProducto() {
    this.ps.addProducto(this.productoNuevo as Productos).subscribe({
      next: () => {
        toast.success('Producto registrado correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al guardar el producto', err);
        const mensajeError =
          err.error?.error ||
          'Ocurrió un error al intentar registrar el producto.';
        toast.error(mensajeError);
      }
    });
  }

  actualizarProducto() {
    const idProducto = this.productoNuevo.id;

    this.ps.updateProducto(
      idProducto,
      this.productoNuevo as Productos
    ).subscribe({
      next: () => {
        toast.success('Producto actualizado correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        toast.error(
          err.error?.error ||
          'Error al actualizar el producto'
        );
      }
    });
  }

  validarCampos(): boolean {
    this.productoNuevo.Nombre =
      (this.productoNuevo.Nombre || '').toString().trim();

    this.productoNuevo.Descripcion =
      (this.productoNuevo.Descripcion || '').toString().trim();

    this.productoNuevo.Codigo_numeral =
      (this.productoNuevo.Codigo_numeral || '').toString().trim();

    this.productoNuevo.Codigo_japon =
      (this.productoNuevo.Codigo_japon || '').toString().trim();

    this.productoNuevo.ExtraDescripcion =
      (this.productoNuevo.ExtraDescripcion || '').toString().trim();

    this.productoNuevo.origen =
      (this.productoNuevo.origen || '').toString().trim();

    const idEstanteria = Number(this.productoNuevo.id_estanteria);
    const idCaja = Number(this.productoNuevo.id_caja);
    const idMarca = Number(this.productoNuevo.id_marca);

    if (
      !this.productoNuevo.Nombre ||
      !this.productoNuevo.Codigo_numeral ||
      !this.productoNuevo.Codigo_japon ||
      !Number.isInteger(idEstanteria) ||
      idEstanteria <= 0 ||
      !Number.isInteger(idCaja) ||
      idCaja <= 0 ||
      !Number.isInteger(idMarca) ||
      idMarca <= 0
    ) {
      toast.error('Por favor, completa todos los campos obligatorios del formulario.');
      return false;
    }

    this.productoNuevo.id_estanteria = idEstanteria;
    this.productoNuevo.id_caja = idCaja;
    this.productoNuevo.id_marca = idMarca;

    const precioNumerico = Number(this.productoNuevo.Precio);

    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0.');
      return false;
    }

    this.productoNuevo.Precio = precioNumerico;

    const stockNumerico = Number(this.productoNuevo.Stock);

    if (
      isNaN(stockNumerico) ||
      !Number.isInteger(stockNumerico) ||
      stockNumerico < 0
    ) {
      toast.error('El stock debe ser un número entero válido (0 o mayor).');
      return false;
    }

    this.productoNuevo.Stock = stockNumerico;

    if (
      this.productoNuevo.Apartado === null ||
      this.productoNuevo.Apartado === '' ||
      this.productoNuevo.Apartado === undefined
    ) {
      this.productoNuevo.Apartado = 0;
    } else {
      const apartadoNumerico =
        Number(this.productoNuevo.Apartado);

      if (
        isNaN(apartadoNumerico) ||
        !Number.isInteger(apartadoNumerico) ||
        apartadoNumerico < 0
      ) {
        toast.error('El stock en apartado debe ser un número entero válido (0 o mayor).');
        return false;
      }

      this.productoNuevo.Apartado =
        apartadoNumerico;
    }

    return true;
  }
}