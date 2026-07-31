import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { DateComponent } from "../../../shared/components/UI/form/date/date.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProveedorService } from '../../../core/services/Proveedores.service';
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-modal-repecion',
  templateUrl: './modal-repecion.page.html',
  styleUrls: ['./modal-repecion.page.scss'],
  standalone: true,
 imports: [
    CommonModule, IonicModule, NgxSonnerToaster, FooterModalComponent, HeaderModalComponent,
    ButtonActionComponent, DateComponent, CardFormComponent, FormsModule, SelectComponent,
    MatDatepickerModule, MatNativeDateModule,
    ReactiveFormsModule, MatAutocompleteModule  
  ],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class ModalRepecionPage implements OnInit {
  productosSolicitados: any[] = [];

  // NUEVO: buscador único, mismo patrón que POSPage
  productoControl = new FormControl('');
  productosFiltrados: any[] = [];
 
  pedidoNuevo = {
    id_asesor: null as any,
    id_proveedor: null as any,
    fecha_estimada: '',
  }
  opcionesProveedor = [
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
   opcionesDestino = [
    { label: 'Almacén', value: 'Almacen' },
    { label: 'Apartado (Pedido)', value: 'Pedido' }
  ];
  constructor(private ps: ProveedorService,
    private dialogRef: MatDialogRef<ModalRepecionPage>) { }

 ngOnInit() {
    this.productoControl.disable(); // arranca deshabilitado, sin proveedor elegido aún

    this.productoControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termino => {
        if (!this.pedidoNuevo.id_proveedor) {
          this.productosFiltrados = [];
          return of(null);
        }
        if (!termino || typeof termino !== 'string' || termino.trim().length < 2) {
          this.productosFiltrados = [];
          return of(null);
        }
        return this.ps.buscarProductos(termino.trim(), this.pedidoNuevo.id_proveedor);
      })
    ).subscribe({
      next: (res: any) => {
        if (res) {
          this.productosFiltrados = res.data || res || [];
        }
      },
      error: (err) => {
        console.error('Error al buscar productos', err);
        this.productosFiltrados = [];
      }
    });
}

onCambiarProveedor() {
    this.productoControl.setValue('', { emitEvent: false });
    this.productosFiltrados = [];

    if (this.pedidoNuevo.id_proveedor) {
      this.productoControl.enable();
    } else {
      this.productoControl.disable();
    }
}

  onEnterProducto(event: any) {
    const termino = event.target.value?.trim();
    if (!termino) return;

    if (this.productosFiltrados.length === 1) {
      this.seleccionarProducto(this.productosFiltrados[0]);
    } else if (this.productosFiltrados.length > 1) {
      toast.info('Selecciona un producto de la lista desplegada.');
    }
  }
  contarOcurrencias(idProducto: number): number {
    return this.productosSolicitados.filter(p => p.id_producto === idProducto).length;
}
 seleccionarProducto(producto: any) {
    const yaExiste = this.productosSolicitados.some(p => p.id_producto === producto.id);

    if (yaExiste) {
      toast.info(`"${producto.Nombre}" ya está en la lista. Se agregó una nueva partida para dividir cantidades entre Almacén y para Pedidos.`,{ duration: 8000 });
    }

    this.productosSolicitados.push({
      id_producto: producto.id,
      Nombre: producto.Nombre,
      Codigo_japon: producto.Codigo_japon,
      Codigo_numeral: producto.Codigo_numeral,
      Stock: producto.Stock,
      cantidad: 1,
      destino: ''
    });

    this.productoControl.setValue('', { emitEvent: false });
    this.productosFiltrados = [];
}
   eliminarFila(index: number) {
    this.productosSolicitados.splice(index, 1);
  }

  cerrar() {
    this.dialogRef.close();
  }
guardarPedido() {
    let idAsesor = null;
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        idAsesor = payload.id;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }

    if (!idAsesor) {
      toast.error('Error de sesión. Inicia sesión nuevamente.');
      return;
    }

    if (!this.pedidoNuevo.id_proveedor || !this.pedidoNuevo.fecha_estimada) {
      toast.error('Completa los datos del proveedor y la fecha.');
      return;
    }

    const filasIncompletas = this.productosSolicitados
      .filter(p => p.id_producto !== null && p.cantidad > 0)
      .some(p => !p.destino);

    if (filasIncompletas) {
      toast.error('Selecciona el destino (Almacén o Apartado) para cada producto agregado.');
      return;
    }

    const productosValidos = this.productosSolicitados
      .filter(p => p.id_producto !== null && p.cantidad > 0 && p.destino)
      .map(p => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad,
        destino: p.destino   // NUEVO: viaja por partida, ya no global
      }));

    if (productosValidos.length === 0) {
      toast.error('Agrega al menos un producto válido reconocido por el sistema');
      return;
    }

    const fechaObj = new Date(this.pedidoNuevo.fecha_estimada);
    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const fechaMySQL = `${anio}-${mes}-${dia}`;

    const payload = {
      id_asesor: idAsesor,
      id_proveedor: this.pedidoNuevo.id_proveedor,
      fecha: fechaMySQL,
      productos: productosValidos
    };

    this.ps.registrarPedido(payload).subscribe({
      next: (response) => {
        toast.success('Pedido registrado exitosamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        toast.error('Ocurrió un error al crear el pedido');
      }
    });
  }
}
