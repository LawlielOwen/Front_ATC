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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ValeService } from "../../../core/services/Vales.service";
import { ClientesService } from '../../../core/services/clientes.service';
import { CotizacionService } from '../../../core/services/Cotizaciones.service';
import { VisitaService } from '../../../core/services/Visitas.service'; // <-- NUEVO

@Component({
  selector: 'app-modal-vale',
  templateUrl: './modal-vale.page.html',
  styleUrls: ['./modal-vale.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, NgxSonnerToaster, FooterModalComponent, HeaderModalComponent,
    ButtonActionComponent, CardFormComponent, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatAutocompleteModule
  ]
})
export class ModalValePage implements OnInit {
  clienteControl = new FormControl<any>('');
  solicitud = {
    id_cliente: null as any,
    orden_compra: '',
  };

  // Variables para Pedidos
  pedidosDisponibles: any[] = [];
  pedidoSeleccionado: any = null;
  cargandoPedidos: boolean = false;

  // Variables para Visitas (Demos)
  visitasDisponibles: any[] = [];
  visitaSeleccionada: any = null;
  cargandoVisitas: boolean = false;

  // Compartidas
  productosSolicitados: any[] = [];
  clientesFiltrados: any[] = [];
  clientes: any[] = [];
  cargandoProductos: boolean = false;
  
  // Variables de Sesión
  idUsuarioActivo: number | null = null;
  rolUsuario: string = '';
  isSoporteTecnico: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ModalValePage>,
    private valeService: ValeService, 
    private cs: ClientesService, 
    private cotizacionService: CotizacionService,
    private visitaService: VisitaService // <-- Inyectado
  ) { }

  ngOnInit() {
    this.cargarDatosSesion();
    this.cargarClientes();

    this.clientesFiltrados = this.clientes;
    this.clienteControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        this.solicitud.id_cliente = value.id;
      } else {
        this.solicitud.id_cliente = null;
        this.clientesFiltrados = this._filtrarClientes(value);
      }
    });

    if (this.isSoporteTecnico) {
      this.cargarVisitasDisponibles();
    } else {
      this.cargarPedidosDisponibles();
    }
  }

  cargarDatosSesion() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.idUsuarioActivo = payload.id;
        this.rolUsuario = payload.Rol ? payload.Rol.toLowerCase().trim() : '';
        this.isSoporteTecnico = (this.rolUsuario === 'soporte tecnico');
      } catch (error) {
        console.error('Error decodificando el token:', error);
      }
    }
  }


  cargarPedidosDisponibles() {
    if (!this.idUsuarioActivo) return;
    this.cargandoPedidos = true;
    
    this.valeService.obtenerPedidosDisponiblesVale(this.idUsuarioActivo, this.rolUsuario).subscribe({
      next: (res: any) => {
        this.pedidosDisponibles = res || [];
        this.cargandoPedidos = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.cargandoPedidos = false;
      }
    });
  }

  seleccionarPedido(idPedidoStr: string) {
    if (!idPedidoStr) return this.limpiarFormulario();

    const idPedido = parseInt(idPedidoStr);
    const pedido = this.pedidosDisponibles.find(p => p.id === idPedido);
    if (!pedido) return;

    this.pedidoSeleccionado = pedido;
    this.clienteControl.setValue({ id: pedido.id_cliente, Nombre: pedido.nombre_cliente });
    this.clienteControl.disable();
    this.solicitud.id_cliente = pedido.id_cliente;

    this.cargandoProductos = true;
    this.cotizacionService.obtenerCotizacionPorId(pedido.id_cotizacion).subscribe({
      next: (res: any) => {
        let detalles = Array.isArray(res) ? res : (res.data || Object.values(res).find(Array.isArray) || []);
        
        this.productosSolicitados = detalles.map((item: any) => ({
          id_producto: item.id_producto,   
          Nombre: item.nombre_producto,
          codigo_producto: item.codigo_producto || item.Codigo_numeral || item.Codigo_japon || '',
          piezas: item.cantidad_producto || item.cantidad
        }));
        this.cargandoProductos = false;
      },
      error: () => {
        toast.error('No se pudieron cargar los productos del pedido.');
        this.cargandoProductos = false;
      }
    });
  }

cargarVisitasDisponibles() {
    if (!this.idUsuarioActivo) return;
    this.cargandoVisitas = true;
    this.valeService.obtenerVisitasDisponiblesVale(this.idUsuarioActivo).subscribe({
      next: (response: any) => {
        
        const datosVisitas = response.visitas || response.data || response || [];
        this.visitasDisponibles = datosVisitas;
        this.cargandoVisitas = false;
        
      },
      error: (err) => {
        console.error('Error al cargar visitas disponibles:', err);
        this.cargandoVisitas = false;
      }
    });
  }

  seleccionarVisita(idVisitaStr: string) {
    if (!idVisitaStr) return this.limpiarFormulario();

    const idVisita = parseInt(idVisitaStr);
    const visita = this.visitasDisponibles.find(v => v.id_visita === idVisita || v.id === idVisita);
    if (!visita) return;

    this.visitaSeleccionada = visita;

    if (visita.id_cliente) {
      this.clienteControl.setValue({ id: visita.id_cliente, Nombre: visita.empresa_destino });
      this.solicitud.id_cliente = visita.id_cliente;
    } else {
      this.clienteControl.setValue(visita.empresa_destino || visita.empresa_no_registrada);
      this.solicitud.id_cliente = null; 
    }
    this.clienteControl.disable();

    this.cargandoProductos = true;
    this.visitaService.obtenerDetallesVisita(idVisita).subscribe({
      next: (res: any) => {
        let detalles = Array.isArray(res) ? res : (res.data || Object.values(res).find(Array.isArray) || []);
        
        this.productosSolicitados = detalles.map((item: any) => ({
          id_demo: item.id_demo, 
          Nombre: item.nombre_modelo,
          codigo_producto: item.numero_serie || 'S/N',
          piezas: item.cantidad
        }));
        this.cargandoProductos = false;
      },
      error: () => {
        toast.error('No se pudieron cargar los equipos de la visita.');
        this.cargandoProductos = false;
      }
    });
  }

  limpiarFormulario() {
    this.pedidoSeleccionado = null;
    this.visitaSeleccionada = null;
    this.clienteControl.enable();
    this.clienteControl.setValue('');
    this.solicitud.id_cliente = null;
    this.productosSolicitados = [];
  }

  guardarSolicitud() {
    if (!this.idUsuarioActivo) {
      toast.error('Error de sesión. Inicia sesión nuevamente.');
      return;
    }

    if (!this.isSoporteTecnico && !this.pedidoSeleccionado) {
      toast.error('Selecciona el pedido del cual deseas generar el vale.');
      return;
    }

    if (this.isSoporteTecnico && !this.visitaSeleccionada) {
      toast.error('Selecciona la visita para la cual deseas solicitar el vale demo.');
      return;
    }

    if (!this.isSoporteTecnico && !this.solicitud.id_cliente) {
      toast.error('Selecciona un cliente destino');
      return;
    }

    const productosValidos = [];
    for (let i = 0; i < this.productosSolicitados.length; i++) {
      const p = this.productosSolicitados[i];
      // Dependiendo del rol usamos id_demo o id_producto
      const idReferencia = this.isSoporteTecnico ? p.id_demo : p.id_producto;

      if (idReferencia) {
        const cantidadNum = Number(p.piezas);
        if (isNaN(cantidadNum) || !Number.isInteger(cantidadNum) || cantidadNum <= 0) {
          toast.error(`Error en la fila ${i + 1}: La cantidad debe ser un número entero mayor a 0.`);
          return;
        }

        if (this.isSoporteTecnico) {
          productosValidos.push({ id_demo: idReferencia, piezas: cantidadNum });
        } else {
          productosValidos.push({ id_producto: idReferencia, piezas: cantidadNum });
        }
      }
    }

    if (productosValidos.length === 0) {
      toast.error('Agrega al menos un artículo válido a la solicitud.');
      return;
    }

   if (this.isSoporteTecnico) {
      
      let nombreEmpresa = null;
      if (!this.solicitud.id_cliente) {
        nombreEmpresa = typeof this.clienteControl.value === 'string' 
                      ? this.clienteControl.value 
                      : (this.clienteControl.value?.Nombre || null);
      }

      const payloadDemo = {
        id_asesor: this.idUsuarioActivo,
        id_cliente: this.solicitud.id_cliente || null,
        empresa_no_registrada: nombreEmpresa, 
        id_visita: this.visitaSeleccionada.id_visita || this.visitaSeleccionada.id,
        productos: productosValidos
      };

      this.valeService.crearValeDemo(payloadDemo).subscribe({
        next: () => {
          toast.success('Solicitud de vale demo creada correctamente');
          this.dialogRef.close(true);
        },
        error: () => toast.error('Ocurrió un error al crear la solicitud demo')
      });

    } else {
      const payloadPedido = {
        id_asesor: this.idUsuarioActivo,
        id_cliente: parseInt(this.solicitud.id_cliente),
        id_pedido: this.pedidoSeleccionado.id, 
        productos: productosValidos
      };

      this.valeService.crearVale(payloadPedido).subscribe({
        next: () => {
          toast.success('Solicitud de vale creada correctamente');
          this.dialogRef.close(true);
        },
        error: () => toast.error('Ocurrió un error al crear la solicitud de vale')
      });
    }
  }

  cargarClientes() {
    this.cs.getClientes(1, 1000).subscribe({
      next: (response: any) => {
        const datos = response.clientes || response.data || response || [];
        if (Array.isArray(datos)) {
          this.clientes = datos.filter((c: any) => c.estatus === 1 || c.Estatus === 1);
          this.clientesFiltrados = this.clientes;
        }
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
    if (!cliente) return '';
    
    if (typeof cliente === 'string') {
      return cliente;
    }
    
    return cliente.nombre || cliente.Nombre || '';
  }
  
  cerrar() {
    this.dialogRef.close();
  }
}