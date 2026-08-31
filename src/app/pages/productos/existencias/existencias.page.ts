import { Component, OnInit, Inject } from '@angular/core';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { StepItemComponent } from "../../../shared/components/UI/modal/step-item/step-item.component";
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
import { ClientesService } from '../../../core/services/clientes.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
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
    CardSelectComponent,
    MatOptionModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ]
})
export class ExistenciasPage implements OnInit {

  productoEncontrado: any = null;
  paso: number = 1;
  cantidad: number = 0;
destino: 'almacen' | 'pedido' | 'Entrega Mostrador' = 'almacen';
  tipoMovimiento: 'Entrada' | 'Salida' = 'Entrada';
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clienteControl = new FormControl<any>('');
  productoControl = new FormControl<any>('');
  productosFiltrados: any[] = [];
  constructor(private dialogRef: MatDialogRef<ExistenciasPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, private ps: ProductoService, private ms: MovimientoService, private cs: ClientesService) {
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
  this.cargarClientes();

  this.clienteControl.valueChanges.subscribe((valorBuscado) => {
    this.clientesFiltrados = this._filtrarClientes(valorBuscado);
  });

  this.productoControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(termino => {
      if (!termino || typeof termino !== 'string' || termino.trim().length < 2) {
        this.productosFiltrados = [];
        return of(null);
      }
      return this.ps.buscarProductoCodigo(termino.trim());
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
seleccionarProducto(producto: any) {
  this.productoEncontrado = producto;

  this.productoControl.setValue('', { emitEvent: false });
  this.productosFiltrados = [];
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
  get esEntrada() { return this.tipoMovimiento === 'Entrada'; }
  get colorHex() { return this.esEntrada ? '#1D9E75' : '#b91c1c'; }
  get bgClass() { return this.esEntrada ? 'bg-[#1D9E75]' : 'bg-[#b91c1c]'; }
  get hoverClass() { return this.esEntrada ? 'hover:bg-[#15805d]' : 'hover:bg-[#991b1b]'; }
  get tituloModal() { return this.esEntrada ? 'Agregar existencias' : 'Registrar Salida'; }

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

  confirmarMovimiento() {
    const cantidadNumerica = Number(this.cantidad);

    if (isNaN(cantidadNumerica) || !Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      toast.error('La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    this.cantidad = cantidadNumerica;

    const codigoP = this.productoEncontrado.Codigo_japon || this.productoEncontrado.Codigo_numeral;

    let idAsesor = null;
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        idAsesor = payload.id;
      } catch (error) {
        console.error('Error al decodificar el token para el movimiento:', error);
      }
    }

    if (!this.esEntrada) {
     if (this.cantidad > this.stockActualVisible) {
        const tipoStock = this.destino === 'almacen' ? 'stock general' : 'apartado';
        toast.error(`No hay suficiente ${tipoStock} para esta salida. Máximo disponible: ${this.stockActualVisible}`);
        return;
      }

      if (!idAsesor) {
        toast.error('Error de sesión: Es obligatorio registrar un asesor responsable para la salida.');
        return;
      }
    }

    if (this.esEntrada) {

      this.ps.entradaProducto(codigoP, this.cantidad, this.destino, idAsesor).subscribe({
        next: () => {
          this.paso = 3;
          toast.success('Entrada registrada correctamente');
        },
        error: (err) => { console.error(err); toast.error('Error al registrar la entrada'); }
      });

    } else {
  
  let idCliente = null;
  let clienteNoRegistrado = null;
  const clienteSeleccionado = this.clienteControl.value;

  if (clienteSeleccionado && typeof clienteSeleccionado === 'object') {
    idCliente = clienteSeleccionado.id || clienteSeleccionado.Id;
  } 
  else if (typeof clienteSeleccionado === 'string' && clienteSeleccionado.trim() !== '') {
    clienteNoRegistrado = clienteSeleccionado.trim();
  }

  this.ms.salidaProducto(codigoP, this.cantidad, this.destino, idAsesor, idCliente, clienteNoRegistrado).subscribe({
    next: () => {
      this.paso = 3;
      toast.success('Salida registrada correctamente');
    },
    error: (err) => { 
      console.error(err); 
      toast.error('Error al registrar la salida'); 
    }
  });
    }
  }
  finalizar() {
    this.dialogRef.close(true);
  }

get opcionesDestino(): CardOption[] {
    if (this.esEntrada) {
      return [
        { value: 'almacen', titulo: 'Para almacén', descripcion: 'Se suma al stock general' },
        { value: 'pedido', titulo: 'Para pedido', descripcion: 'Se suma al stock en apartado' }
      ];
    } else {
      return [
        { value: 'pedido', titulo: 'Para pedido', descripcion: 'Descuenta de apartados' },
        { value: 'Entrega Mostrador', titulo: 'Entregar en mostrador', descripcion: 'Descuenta de stock libre' }
      ];
    }
  }
  cargarClientes() {
    this.cs.getClientes(1, 1000).subscribe({
      next: (response: any) => {
        const datosCrudos = response.clientes || response.data || response || [];
        if (Array.isArray(datosCrudos)) {
          this.clientes = datosCrudos.filter((c: any) => c.estatus === 1 || c.Estatus === 1);
          this.clientesFiltrados = this.clientes;
        }
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        toast.error('Error al cargar la lista de clientes');
      }
    });
  }
  private _filtrarClientes(valorBuscado: any): any[] {
    const filtro = (typeof valorBuscado === 'string' ? valorBuscado : '').toLowerCase();

    return this.clientes.filter(cliente => {
      const nombreCliente = cliente.nombre || cliente.Nombre || '';
      return nombreCliente.toLowerCase().includes(filtro);
    });
  }

  mostrarNombreCliente(cliente: any): string {
    return cliente ? (cliente.nombre || cliente.Nombre || '') : '';
  }
get stockActualVisible() {
    if (!this.productoEncontrado) return 0;
    
    if (this.destino === 'almacen' || this.destino === 'Entrega Mostrador') {
      return this.productoEncontrado.Stock || 0;
    } 
    return this.productoEncontrado.Apartado || 0;
  }

  get nuevoStock() {
    if (!this.productoEncontrado) return 0;
    return this.esEntrada
      ? this.stockActualVisible + this.cantidad
      : this.stockActualVisible - this.cantidad;
  }
}
