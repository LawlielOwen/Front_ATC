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
import { ValeService } from "../../../core/services/Vales.service";
import { ValeSalida } from '../../../shared/model/vales.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ClientesService } from '../../../core/services/clientes.service';
import { CotizacionService } from '../../../core/services/Cotizaciones.service';

@Component({
  selector: 'app-modal-vale',
  templateUrl: './modal-vale.page.html',
  styleUrls: ['./modal-vale.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgxSonnerToaster,
    FooterModalComponent,
    HeaderModalComponent,
    ButtonActionComponent,
    InputComponent,
    CardFormComponent,
    ReactiveFormsModule, // <-- ¡Muy importante para formControl!
    MatFormFieldModule,  // <-- Para <mat-form-field>
    MatInputModule,      // <-- Para matInput
    MatAutocompleteModule
  ]
})
export class ModalValePage implements OnInit {
  clienteControl = new FormControl<any>('');
  solicitud = {
    id_cliente: null,
    orden_compra: '',
    num_factura: ''
  };
  pedidosDisponibles: any[] = [];
  pedidoSeleccionado: any = null;
  productosSolicitados: any[] = [];
  cargandoPedidos: boolean = false;
  clientesFiltrados: any[] = [];
  cargandoProductosPedido: boolean = false;

  clientes: any[] = [];
  constructor(private dialogRef: MatDialogRef<ModalValePage>,
    private valeService: ValeService, private cs: ClientesService, private cotizacionService: CotizacionService,) { }

  ngOnInit() {
  this.clientesFiltrados = this.clientes;
  this.clienteControl.valueChanges.subscribe(value => {
    if (typeof value === 'object' && value !== null) {
      this.solicitud.id_cliente = value.id;
    } else {
      this.solicitud.id_cliente = null;
      this.clientesFiltrados = this._filtrarClientes(value);
    }
  });
  this.cargarClientes();
  this.cargarPedidosDisponibles();
}
  cargarPedidosDisponibles() {
    const usuarioString = localStorage.getItem('user');
    const idAsesor = usuarioString ? JSON.parse(usuarioString).id : null;
    if (!idAsesor) return;

    this.cargandoPedidos = true;
    this.valeService.obtenerPedidosDisponiblesVale(idAsesor).subscribe({
      next: (res: any) => {
        this.pedidosDisponibles = res || [];
        this.cargandoPedidos = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos disponibles', err);
        this.cargandoPedidos = false;
      }
    });
  }
seleccionarPedido(idPedidoStr: string) {
  if (!idPedidoStr) {
    this.pedidoSeleccionado = null;
    this.clienteControl.enable();
    this.clienteControl.setValue('');
    this.solicitud.id_cliente = null;
    this.solicitud.orden_compra = '';
    this.productosSolicitados = [];
    return;
  }

  const idPedido = parseInt(idPedidoStr);
  const pedido = this.pedidosDisponibles.find(p => p.id === idPedido);
  if (!pedido) return;

  this.pedidoSeleccionado = pedido;

  this.clienteControl.setValue({ id: pedido.id_cliente, Nombre: pedido.nombre_cliente });
  this.clienteControl.disable();
  this.solicitud.id_cliente = pedido.id_cliente;
  this.solicitud.orden_compra = pedido.orden_compra || '';

  this.cargarProductosDelPedido(pedido.id_cotizacion);
}
cargarProductosDelPedido(idCotizacion: number) {
  this.cargandoProductosPedido = true;
  this.cotizacionService.obtenerCotizacionPorId(idCotizacion).subscribe({
    next: (res: any) => {
      let detallesCrudos = [];
      if (Array.isArray(res)) {
        detallesCrudos = res;
      } else if (res.data && Array.isArray(res.data)) {
        detallesCrudos = res.data;
      } else {
        detallesCrudos = Object.values(res).find(Array.isArray) || [];
      }

      this.productosSolicitados = detallesCrudos.map((item: any) => ({
        id_producto: item.id_producto,   
        Nombre: item.nombre_producto,
        codigo: item.Codigo_numeral || item.Codigo_japon || '',
        piezas: item.cantidad_producto
      }));

      this.cargandoProductosPedido = false;
    },
    error: (err) => {
      console.error('Error al cargar productos del pedido', err);
      toast.error('No se pudieron cargar los productos del pedido.');
      this.cargandoProductosPedido = false;
    }
  });
}

  cerrar() {
    this.dialogRef.close();
  }
  guardarSolicitud() {
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
    // --------------------------------------------------------

    if (!idAsesor) {
      toast.error('Error de sesión. Inicia sesión nuevamente.');
      return;
    }

    if (!this.pedidoSeleccionado) {
      toast.error('Selecciona el pedido del cual deseas generar el vale.');
      return;
    }

    if (!this.solicitud.id_cliente) {
      toast.error('Selecciona un cliente destino');
      return;
    }

    const productosValidos = [];
    for (let i = 0; i < this.productosSolicitados.length; i++) {
      const p = this.productosSolicitados[i];
      if (p.id_producto) {
        const cantidadNum = Number(p.piezas);
        if (isNaN(cantidadNum) || !Number.isInteger(cantidadNum) || cantidadNum <= 0) {
          toast.error(`Error en la fila ${i + 1}: La cantidad debe ser un número entero mayor a 0.`);
          return;
        }
        productosValidos.push({ id_producto: p.id_producto, piezas: cantidadNum });
      }
    }

    if (productosValidos.length === 0) {
      toast.error('Agrega al menos un producto válido a la solicitud.');
      return;
    }

    const payload = {
      id_asesor: idAsesor,
      id_cliente: parseInt(this.solicitud.id_cliente),
      id_pedido: this.pedidoSeleccionado.id,   // NUEVO
      productos: productosValidos
    };

    this.valeService.crearVale(payload).subscribe({
      next: (response) => {
        toast.success('Solicitud de vale creada correctamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        toast.error('Ocurrió un error al crear la solicitud de vale');
      }
    });
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
    // Seguro para mostrar el nombre correcto cuando el usuario hace clic
    return cliente ? (cliente.nombre || cliente.Nombre || '') : '';
  }
}
