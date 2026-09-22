import { Component, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { Subject, of, timer } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil } from 'rxjs/operators';

import { PedidoService, NuevoPedidoInput, DetallePedidoInput } from '../../../core/services/Pedidos.service';
import { CotizacionService } from '../../../core/services/Cotizaciones.service';
import { ClientesService } from '../../../core/services/clientes.service';
import { AsesoresService } from '../../../core/services/Asesores.service';
import { FooterModalComponent } from '../../../shared/components/UI/modal/footer-modal/footer-modal.component';
import { HeaderModalComponent } from '../../../shared/components/UI/modal/header-modal/header-modal.component';
import { ButtonActionComponent } from '../../../shared/components/UI/buttons/button-action/button-action.component';
import { InputComponent } from '../../../shared/components/UI/form/input/input.component';
import { SelectComponent } from '../../../shared/components/UI/form/select/select.component';
import { CardFormComponent } from '../../../shared/components/UI/form/card-form/card-form.component';

type MonedaPedido = 'MONEDA NACIONAL' | 'USD';

interface PartidaPedido extends DetallePedidoInput {
  nombre_producto: string;
  codigo_producto: string;
  subtotal_partida: number;
}

@Component({
  selector: 'app-alta-pedido',
  templateUrl: './alta-pedido.page.html',
  styleUrls: ['./alta-pedido.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, FormsModule, ReactiveFormsModule,
    MatAutocompleteModule, MatFormFieldModule, MatInputModule, NgxSonnerToaster,
    FooterModalComponent, HeaderModalComponent, ButtonActionComponent,
    InputComponent, SelectComponent, CardFormComponent
  ]
})
export class AltaPedidoPage implements OnInit, OnDestroy {
  private readonly destruir$ = new Subject<void>();
  
  clienteControl = new FormControl<any>('');
  productoControl = new FormControl<any>('');
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  productosFiltrados: any[] = [];
  asesores: any[] = [];
  detalles: PartidaPedido[] = [];
  
  guardando = false;
  cargandoClientes = false;
  cargandoAsesores = false;
  
  subtotal_final = 0;
  iva_final = 0;
  total_final = 0;

  // Variables para MODO EDICIÓN
  esEdicion = false;
  idPedidoEdit: number = 0;

  pedido: Omit<NuevoPedidoInput, 'detalles' | 'id_cliente' | 'moneda'> & {
    id_cliente: number | null;
    moneda: MonedaPedido;
  } = {
    id_cliente: null, id_asesor: 0, orden_compra: '',
    moneda: 'MONEDA NACIONAL', tipo_cambio: 1, vigencia_dias: 15
  };

  constructor(
    private pedidosService: PedidoService,
    private cotizacionService: CotizacionService,
    private clientesService: ClientesService,
    private asesoresService: AsesoresService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<AltaPedidoPage> | null,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarAsesores();
    
    // VALIDACIÓN: ¿Viene información para editar?
    if (this.data && this.data.pedido) {
      this.esEdicion = true;
      this.idPedidoEdit = this.data.pedido.id;
      
      // Mapear cabecera
      this.pedido.orden_compra = this.data.pedido.orden_compra || '';
      this.pedido.moneda = this.data.pedido.moneda || 'MONEDA NACIONAL';
      this.pedido.tipo_cambio = Number(this.data.pedido.tipo_cambio) || 1;
      this.pedido.id_cliente = this.data.pedido.id_cliente;
      this.pedido.id_asesor = this.data.pedido.id_asesor;
      
      // Forzar texto del cliente
      const nombreCliente = this.data.pedido.nombre_cliente || this.data.pedido.empresa || 'Cliente seleccionado';
      this.clienteControl.setValue(nombreCliente, { emitEvent: false });

      // Mapear detalles
      if (Array.isArray(this.data.detalles)) {
        this.detalles = this.data.detalles.map((d: any) => ({
          id_producto: d.id_producto || null,
          nombre_producto: d.descripcion || d.nombre_producto || d.descripcion_manual || '',
          codigo_producto: d.codigo_numeral || d.codigo_japon || d.codigo_manual || '',
          codigo_manual: d.codigo_manual || null,
          descripcion_manual: d.descripcion_manual || null,
          extra_descripcion_manual: d.extra_descripcion_manual || null,
          cantidad: Number(d.cantidad) || 1,
          precio_unitario: Number(d.precio_unitario) || 0,
          costo_flete: Number(d.costo_flete) || 0,
          subtotal_partida: 0
        }));
        this.calcularTotales();
      }
    }

    this.clienteControl.valueChanges.pipe(takeUntil(this.destruir$)).subscribe(valor => {
      this.clientesFiltrados = this.filtrarClientes(valor);
      if (valor && typeof valor === 'object') {
        this.onClienteSeleccionado(valor);
      } else if (!this.esEdicion) {
        this.pedido.id_cliente = null;
      }
    });

    this.productoControl.valueChanges.pipe(
      switchMap(valor => {
        this.productosFiltrados = [];
        const termino = typeof valor === 'string' ? valor.trim() : '';
        if (termino.length < 2) return of({ productos: [] });
        return timer(300).pipe(
          switchMap(() => this.cotizacionService.buscarProductoParaPOS(termino)),
          catchError(() => {
            toast.error('No se pudieron buscar los productos.');
            return of({ productos: [] });
          })
        );
      }),
      takeUntil(this.destruir$)
    ).subscribe((res: any) => {
      this.productosFiltrados = Array.isArray(res?.productos) ? res.productos : [];
    });
  }

  cargarClientes(): void {
    this.cargandoClientes = true;
    this.clientesService.getClientes(1, 1000).pipe(
      takeUntil(this.destruir$), finalize(() => this.cargandoClientes = false)
    ).subscribe({
      next: (res: any) => {
        const lista = res?.clientes ?? res?.data ?? res;
        this.clientes = Array.isArray(lista) ? lista.filter(c => Number(c.estatus ?? c.Estatus) === 1) : [];
        this.clientesFiltrados = this.filtrarClientes(this.clienteControl.value);
      },
      error: () => toast.error('No se pudo cargar la lista de clientes.')
    });
  }

  cargarAsesores(): void {
    this.cargandoAsesores = true;
    this.asesoresService.getAsesores().pipe(
      takeUntil(this.destruir$), finalize(() => this.cargandoAsesores = false)
    ).subscribe({
      next: (res: any) => {
        const lista = res?.asesores ?? res?.data ?? res;
        this.asesores = Array.isArray(lista) ? lista.filter(a =>
          ['Asesor', 'Administrador'].includes(a.Rol) && Number(a.Estatus) === 1
        ) : [];
      },
      error: () => toast.error('No se pudo cargar la lista de asesores.')
    });
  }

  private filtrarClientes(valor: any): any[] {
    const termino = (typeof valor === 'string' ? valor : '').toLowerCase().trim();
    return this.clientes.filter(c => this.mostrarNombreCliente(c).toLowerCase().includes(termino));
  }

  mostrarNombreCliente(cliente: any): string {
    if (typeof cliente === 'string') return cliente;
    return cliente?.nombre || cliente?.Nombre || cliente?.nombre_cliente_final || '';
  }

  onClienteSeleccionado(cliente: any): void {
    if (!cliente || typeof cliente !== 'object') return;
    const id = Number(cliente.id ?? cliente.Id ?? cliente.ID);
    this.pedido.id_cliente = Number.isInteger(id) && id > 0 ? id : null;
    this.pedido.id_asesor = Number(cliente.id_asesor) || 0;
  }

  seleccionarProducto(producto: any): void {
    if (this.guardando || !producto) return;
    const id = Number(producto.id);
    if (!Number.isInteger(id) || id <= 0) {
      toast.error('El producto no tiene un identificador válido.');
      return;
    }
    this.detalles.push({
      id_producto: id,
      nombre_producto: producto.Nombre || '',
      codigo_producto: producto.Codigo_numeral || producto.Codigo_japon || '',
      codigo_manual: null, descripcion_manual: null, extra_descripcion_manual: null,
      cantidad: 1, precio_unitario: Number(producto.Precio),
      costo_flete: 0, subtotal_partida: 0
    });
    this.productoControl.setValue('');
    this.calcularTotales();
  }

  onEnterProducto(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.getAttribute('aria-activedescendant')) return;
    if (this.productosFiltrados.length === 1) {
      this.seleccionarProducto(this.productosFiltrados[0]);
    } else if (this.productosFiltrados.length > 1) {
      toast.info('Selecciona un producto de la lista.');
    }
  }

  agregarItemManual(): void {
    if (this.guardando) return;
    this.detalles.push({
      id_producto: null, 
      nombre_producto: '', 
      codigo_producto: '',
      codigo_manual: '', 
      descripcion_manual: '', 
      extra_descripcion_manual: '',
      cantidad: 1, 
      precio_unitario: null as any, 
      costo_flete: null as any,  
      subtotal_partida: 0
    });
    this.calcularTotales();
  }

  eliminarItem(index: number): void {
    if (this.guardando || index < 0 || index >= this.detalles.length) return;
    this.detalles.splice(index, 1);
    this.calcularTotales();
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  obtenerPrecioEnMonedaActual(montoMXN: number): number {
    if (this.pedido.moneda !== 'USD') return Number(montoMXN) || 0;
    const tc = Number(this.pedido.tipo_cambio);
    return Number.isFinite(tc) && tc > 0 ? Number(montoMXN) / tc : 0;
  }

  actualizarPrecio(item: PartidaPedido, valor: number | string | null): void {
    this.actualizarMonto(item, 'precio_unitario', valor);
  }

  actualizarFlete(item: PartidaPedido, valor: number | string | null): void {
    this.actualizarMonto(item, 'costo_flete', valor);
  }

  private actualizarMonto(item: PartidaPedido, campo: 'precio_unitario' | 'costo_flete', valor: number | string | null): void {
    if (this.guardando) return;
    const tc = this.pedido.moneda === 'USD' ? Number(this.pedido.tipo_cambio) : 1;
    item[campo] = valor === null || valor === '' || !Number.isFinite(tc) || tc <= 0
      ? NaN : this.redondear(Number(valor) * tc);
    this.calcularTotales();
  }

  cambiarMoneda(moneda: string): void {
    if (this.guardando || !['MONEDA NACIONAL', 'USD'].includes(moneda)) return;
    this.pedido.moneda = moneda as MonedaPedido;
    this.pedido.tipo_cambio = moneda === 'USD' ? 0 : 1;
    this.calcularTotales();
    if (moneda === 'USD') toast.info('Captura el tipo de cambio: pesos por dólar.');
  }

  calcularTotales(): void {
    let subtotalMXN = 0;
    for (const item of this.detalles) {
      const monto = Number(item.cantidad) * this.redondear(Number(item.precio_unitario))
        + this.redondear(Number(item.costo_flete));
      item.subtotal_partida = Number.isFinite(monto) ? this.redondear(monto) : 0;
      subtotalMXN += item.subtotal_partida;
    }
    this.subtotal_final = this.redondear(this.obtenerPrecioEnMonedaActual(subtotalMXN));
    this.iva_final = this.redondear(this.subtotal_final * 0.16);
    this.total_final = this.redondear(this.subtotal_final + this.iva_final);
  }

  guardarPedido(): void {
    if (this.guardando) return;
    const idCliente = Number(this.pedido.id_cliente);
    const idAsesor = Number(this.pedido.id_asesor);
    const tc = this.pedido.moneda === 'USD' ? Number(this.pedido.tipo_cambio) : 1;
    const fallar = (mensaje: string) => toast.warning(mensaje);
    
    // Validaciones base
    if (!this.esEdicion && (!Number.isInteger(idCliente) || idCliente <= 0)) {
      fallar('Selecciona un cliente registrado de la lista.'); return;
    }
    if (!this.esEdicion && (!Number.isInteger(idAsesor) || idAsesor <= 0)) {
      fallar('Selecciona un asesor válido.'); return;
    }
    if (!Number.isFinite(tc) || tc <= 0 || tc > 999999.9999) {
      fallar('Captura un tipo de cambio válido, mayor que cero.'); return;
    }
    if ((this.pedido.orden_compra || '').trim().length > 100) {
      fallar('La orden de compra admite hasta 100 caracteres.'); return;
    }
    if (!this.detalles.length) { fallar('Agrega al menos un producto.'); return; }

    // Validar partidas
    for (const [index, item] of this.detalles.entries()) {
      const cantidad = Number(item.cantidad);
      const precio = Number(item.precio_unitario);
      const flete = Number(item.costo_flete);
      const prefijo = `Partida ${index + 1}: `;
      if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > 2147483647) {
        fallar(prefijo + 'la cantidad debe ser un entero positivo válido.'); return;
      }
      if (!Number.isFinite(precio) || this.redondear(precio) <= 0 || precio > 99999999.99) {
        fallar(prefijo + 'captura un precio mayor que cero y dentro del límite permitido.'); return;
      }
      if (!Number.isFinite(flete) || flete < 0 || flete > 99999999.99) {
        fallar(prefijo + 'captura un flete válido; puede ser cero.'); return;
      }
      if (item.id_producto === null && !item.descripcion_manual?.trim()) {
        fallar(prefijo + 'escribe la descripción del producto manual.'); return;
      }
    }

    // Armado del arreglo de detalles que comparten ambas peticiones
    const payloadDetalles = this.detalles.map(item => ({
      id_producto: item.id_producto,
      codigo_manual: item.id_producto === null ? item.codigo_manual?.trim() || null : null,
      descripcion_manual: item.id_producto === null ? item.descripcion_manual!.trim() : null,
      extra_descripcion_manual: item.id_producto === null ? item.extra_descripcion_manual?.trim() || null : null,
      cantidad: Number(item.cantidad),
      precio_unitario: this.redondear(Number(item.precio_unitario)),
      costo_flete: this.redondear(Number(item.costo_flete))
    }));

    this.guardando = true;

    // BIFURCACIÓN: ¿Editar o Crear?
    if (this.esEdicion) {
      const payloadEdit = {
        orden_compra: this.pedido.orden_compra?.trim() || null,
        detalles: payloadDetalles
      };
      
      // Llamada al endpoint de modificación
      this.pedidosService.modificarPedido(this.idPedidoEdit, payloadEdit).pipe(
        takeUntil(this.destruir$), finalize(() => this.guardando = false)
      ).subscribe({
        next: (respuesta: any) => {
          toast.success(respuesta?.message || respuesta?.mensaje || 'Pedido actualizado correctamente.');
          if (this.dialogRef) this.dialogRef.close(true);
        },
        error: error => toast.error(error?.error?.error || error?.error?.mensaje || 'No se pudo modificar el pedido.')
      });

    } else {
      const payloadNuevo: NuevoPedidoInput = {
        id_cliente: idCliente, id_asesor: idAsesor,
        orden_compra: this.pedido.orden_compra?.trim() || null,
        moneda: this.pedido.moneda, 
        tipo_cambio: Number(tc.toFixed(4)), 
        vigencia_dias: Number(this.pedido.vigencia_dias),
        detalles: payloadDetalles
      };
      
      // Llamada al endpoint original
      this.pedidosService.crearPedidoDirecto(payloadNuevo).pipe(
        takeUntil(this.destruir$), finalize(() => this.guardando = false)
      ).subscribe({
        next: respuesta => {
          if (!Number.isInteger(Number(respuesta?.id_pedido)) || Number(respuesta.id_pedido) <= 0) {
            toast.error(respuesta?.mensaje || 'No se pudo crear el pedido.'); return;
          }
          toast.success(respuesta.mensaje || 'Pedido creado correctamente.');
          if (this.dialogRef) this.dialogRef.close(respuesta);
          else void this.router.navigate(['/pedidos']);
        },
        error: error => toast.error(error?.error?.mensaje || error?.error?.message || 'No se pudo crear el pedido.')
      });
    }
  }

  cerrar(): void {
    if (this.guardando) return;
    if (this.dialogRef) this.dialogRef.close();
    else void this.router.navigate(['/pedidos']);
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }
}