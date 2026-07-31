import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { toast } from 'ngx-sonner';
import { ActivatedRoute } from '@angular/router';
import { CotizacionService } from '../../../core/services/Cotizaciones.service'
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../../core/services/clientes.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Asesor } from "../../../shared/model/asesor.model"
import { AsesoresService } from "../../../core/services/Asesores.service";

@Component({
  selector: 'app-pos',
  templateUrl: './pos.page.html',
  styleUrls: ['./pos.page.scss'],
  standalone: true,
  imports: [
    IonicModule, HeaderComponent, NgxSonnerToaster, FormsModule, CommonModule, MatAutocompleteModule, MatInputModule,
    MatFormFieldModule, ReactiveFormsModule,
  ]
})
export class POSPage implements OnInit {
  isEditMode: boolean = false;
  cotizacionHeaderData: any = null;
  cotizacionIdEdit: number | null = null;
  clienteControl = new FormControl<any>('');
  idUsuario: number = 0;
  rolUsuario: string = '';
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  asesores: Asesor[] = [];

  productoControl = new FormControl('');
  productosFiltrados: any[] = [];
  cotizacion = {
    id_asesor: 0,
    id_cliente: null,
    nombre_prospecto: '',
    contacto: '',
    ciudad_destino: '',
    moneda: 'MONEDA NACIONAL',
    tipo_cambio: 1,
    vigencia_dias: 15
  };
  subtotal_final: number = 0;
  iva_final: number = 0;
  total_final: number = 0;
  detalles: any[] = [];
  public data: any
  constructor(
    private cs: CotizacionService,
    private c: ClientesService,
    private router: Router,
    private service: AsesoresService,
    private route: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['cotizacionData']) {
      this.cotizacionHeaderData = navigation.extras.state['cotizacionData'];
    }
  }

  ngOnInit() {
    this.cargarClientes();

    this.clienteControl.valueChanges.subscribe((valorBuscado) => {
      this.clientesFiltrados = this._filtrarClientes(valorBuscado);

      if (typeof valorBuscado === 'object' && valorBuscado !== null) {
        this.cotizacion.id_cliente = valorBuscado.id || valorBuscado.Id || valorBuscado.ID;
        this.cotizacion.nombre_prospecto = ''; // Limpiamos el texto libre
      }
      else if (typeof valorBuscado === 'string') {
        this.cotizacion.id_cliente = null; // No hay ID porque no está en la BD
        this.cotizacion.nombre_prospecto = valorBuscado; // Guardamos lo que tecleó
      }
    });
    this.productoControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termino => {
        if (!termino || typeof termino !== 'string' || termino.trim().length < 2) {
          this.productosFiltrados = [];
          return of(null);
        }
        return this.cs.buscarProductoParaPOS(termino.trim());
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.productos) {
          this.productosFiltrados = res.productos;
        }
      }
    });
    this.cargarAsesores();
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.isEditMode = true;
        this.cotizacionIdEdit = Number(idStr);
        this.cargarCotizacionParaEditar(this.cotizacionIdEdit);
      }
    });
  }
  cargarCotizacionParaEditar(id: number) {
    if (this.cotizacionHeaderData) {
      const cabecera = this.cotizacionHeaderData;

      const prospectoLimpio = cabecera.nombre_prospecto !== 'null' ? cabecera.nombre_prospecto : '';
      const clienteFinalLimpio = cabecera.nombre_cliente_final !== 'null' ? cabecera.nombre_cliente_final : '';
      const nombreReal = clienteFinalLimpio || prospectoLimpio || cabecera.Cliente || '';

      this.cotizacion = {
        id_asesor: cabecera.id_asesor,
        id_cliente: cabecera.id_cliente,
        nombre_prospecto: nombreReal,
        contacto: cabecera.contacto || '',
        ciudad_destino: cabecera.ciudad_destino || '',
        moneda: cabecera.moneda || 'MONEDA NACIONAL',
        tipo_cambio: cabecera.tipo_cambio || 1,
        vigencia_dias: cabecera.vigencia_dias || 15
      };

      setTimeout(() => {
        const esClienteOficial = cabecera.id_cliente && cabecera.id_cliente !== 0 && cabecera.id_cliente !== 'null';

        if (esClienteOficial) {
          const clienteEncontrado = this.clientes.find(c => c.id == cabecera.id_cliente)
            || { id: cabecera.id_cliente, Nombre: nombreReal };

          if (clienteEncontrado) {
            this.clienteControl.setValue(clienteEncontrado);
          }
        } else if (nombreReal) {

          this.clienteControl.setValue(nombreReal);
        }
      }, 300);
    }

    this.cs.obtenerCotizacionPorId(id).subscribe({
      next: (res: any) => {
        let detallesCrudos = [];
        if (Array.isArray(res)) {
          detallesCrudos = res;
        } else if (res.data && Array.isArray(res.data)) {
          detallesCrudos = res.data;
        } else {
          detallesCrudos = Object.values(res).find(Array.isArray) || [];
        }

        this.detalles = detallesCrudos.map((item: any) => ({
          id_producto: item.id_producto,
          nombre_producto: item.nombre_producto,
          Codigo_japon: item.Codigo_japon,
          Codigo_numeral: item.Codigo_numeral,
          Modelo: item.modelo_producto || item.Modelo,
          Marca: item.marca_producto || item.Marca,
          cantidad_producto: item.cantidad_producto,
          precio_unitario_cotizado: item.precio_unitario_cotizado,
          origen: item.origen || '',
          tiempo_entrega: item.tiempo_entrega || ''
        }));

        this.calcularTotales();
      },
      error: (err) => {
        console.error('Error al cargar cotización para editar', err);
        toast.error('No se pudieron cargar los productos de la cotización');
      }
    });
  }
  cargarAsesores() {
    this.service.getAsesores().subscribe({
      next: (response: any) => {
        this.asesores = response.filter((asesor: Asesor) => ['Asesor', 'Administrador'].includes(asesor.Rol));
        if (this.data && this.data.id_asesor) {
          this.cotizacion.id_asesor = this.data.id_asesor.toString();
        }
      },
      error: (err) => console.error('Error al cargar asesores', err)
    });
  }
  onClienteSeleccionado(cliente: any) {
    if (!cliente || typeof cliente !== 'object') return;

    if (cliente.id_asesor) {
      this.cotizacion.id_asesor = cliente.id_asesor;
    }

    this.cotizacion.contacto = cliente.contacto_principal || '';
  }
  onEnterProducto(event: any) {
    const termino = event.target.value?.trim();
    if (!termino) return;

    if (this.productosFiltrados.length === 1) {
      this.seleccionarProducto(this.productosFiltrados[0]);
    } else if (this.productosFiltrados.length > 1) {
      toast.info('Por favor, selecciona un producto de la lista desplegada.');
    }
  }
  seleccionarProducto(producto: any) {
    this.agregarItem(producto);

    // Limpiamos el buscador inmediatamente para que quede listo para el siguiente producto
    this.productoControl.setValue('', { emitEvent: false });
    this.productosFiltrados = [];
  }

  agregarItem(productoDB: any) {
    // Mapeamos lo que viene de BD a lo que necesita el detalle
    this.detalles.push({
      id_producto: productoDB.id,
      nombre_producto: productoDB.Nombre,
      Codigo_japon: productoDB.Codigo_japon,
      Codigo_numeral: productoDB.Codigo_numeral,
      Modelo: productoDB.Modelo,

      Marca: productoDB.Marca || productoDB.nombre_marca,

      cantidad_producto: 1,
      precio_unitario_cotizado: productoDB.Precio,

      origen: productoDB.origen || '',
      tiempo_entrega: ''
    });
    this.calcularTotales();
  }

  eliminarItem(index: number) {
    this.detalles.splice(index, 1);
    this.calcularTotales();
  }


  guardarYDescargar() {
    if (this.detalles.length === 0) {
      toast.error('La cotización debe tener al menos un producto');
      return;
    }
    if (!this.cotizacion.id_cliente && !this.cotizacion.nombre_prospecto) {
      toast.warning('Debes seleccionar un cliente o escribir el nombre del prospecto.');
      return;
    }
       if (!this.cotizacion.id_asesor) {
      toast.warning('Debes seleccionar un asesor antes de continuar.');
      return;
    }

    Swal.fire({
      title: 'Procesando...',
      text: this.isEditMode ? 'Actualizando cotización y generando PDF' : 'Guardando cotización y generando PDF',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const payload = {
      ...this.cotizacion,
      subtotal: this.subtotal_final,
      iva: this.iva_final,
      total: this.total_final,
      detalles: this.detalles
    };

    if (this.isEditMode && this.cotizacionIdEdit) {

      this.cs.modificarCotizacion(this.cotizacionIdEdit, payload).subscribe({
        next: () => {
          this.descargarPDFFlujo(this.cotizacionIdEdit!);
        },
        error: (err) => {
          Swal.close();
          toast.error('Error al actualizar la cotización');
        }
      });
    } else {

      this.cs.crearCotizacion(payload).subscribe({
        next: (res: any) => {
          const nuevoId = res.id_cotizacion;
          this.descargarPDFFlujo(nuevoId);
        },
        error: (err) => {
          Swal.close();
          toast.error('Error al guardar la cotización');
        }
      });
    }
  }

  private descargarPDFFlujo(idCotizacion: number) {
    this.cs.descargarPDF(idCotizacion).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cotizacion_ATC.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.close();

     
        if (this.isEditMode) {
          this.router.navigate(['/cotizaciones']); 
        } else {
          this.limpiarFormulario();
        }
      },
      error: () => {
        Swal.close();
        toast.error('Se guardó correctamente, pero falló la generación del PDF.');

        if (this.isEditMode) {
          this.router.navigate(['/cotizaciones']);
        } else {
          this.limpiarFormulario();
        }
      }
    });
  }
  guardarCotizacion() {
    if (this.detalles.length === 0) {
      toast.error('La cotización debe tener al menos un producto');
      return;
    }

    if (!this.cotizacion.id_cliente && !this.cotizacion.nombre_prospecto) {
      toast.warning('Debes seleccionar un cliente o escribir el nombre de un cliente.');
      return;
    }
      if (!this.cotizacion.id_asesor) {
      toast.warning('Debes seleccionar un asesor antes de continuar.');
      return;
    }
    const payload = {
      ...this.cotizacion,
      subtotal: this.subtotal_final,
      iva: this.iva_final,
      total: this.total_final,
      detalles: this.detalles
    };

    if (this.isEditMode && this.cotizacionIdEdit) {

      this.cs.modificarCotizacion(this.cotizacionIdEdit, payload).subscribe({
        next: (res) => {
          toast.success('Cotización actualizada con éxito.');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => toast.error('Error al actualizar la cotización')
      });
    } else {

      this.cs.crearCotizacion(payload).subscribe({
        next: (res) => {
          toast.success('Cotización creada con éxito. Folio generado.');
          this.limpiarFormulario();
        },
        error: (err) => toast.error('Error al guardar la cotización')
      });
    }
  }
  cambiarMoneda(nuevaMoneda: string) {
    this.cotizacion.moneda = nuevaMoneda;

    if (nuevaMoneda === 'USD') {
      this.cs.obtenerTipoCambioDelDia().subscribe({
        next: (res) => {
          this.cotizacion.tipo_cambio = Number(parseFloat(res.tipo_cambio).toFixed(2));
          this.calcularTotales();
          toast.success('Moneda cambiada a USD');
        },
        error: () => {
          this.cotizacion.tipo_cambio = 18.50;
          this.calcularTotales();
          toast.error('No se conectó con Banxico. Usando 18.50');
        }
      });
    } else {
      this.cotizacion.tipo_cambio = 1;
      this.calcularTotales();
    }
  }
  cargarClientes() {
    this.c.getClientes(1, 1000).subscribe({
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
    if (!cliente) return '';

    if (typeof cliente === 'string') {
      return cliente;
    }

    return cliente.nombre || cliente.Nombre || cliente.nombre_cliente_final || '';
  }
  limpiarFormulario() {
    this.clienteControl.setValue('');
    this.cotizacion = {
      id_asesor: this.cotizacion.id_asesor,
      id_cliente: null,
      nombre_prospecto: '',
      contacto: '',
      ciudad_destino: '',
      moneda: 'MONEDA NACIONAL',
      tipo_cambio: 1,
      vigencia_dias: 15
    };

    this.detalles = [];
    this.subtotal_final = 0;
    this.iva_final = 0;
    this.total_final = 0;
  }
  calcularTotales() {
    let subtotalMXN = this.detalles.reduce((acc, item) =>
      acc + (item.precio_unitario_cotizado * item.cantidad_producto), 0);

    if (this.cotizacion.moneda === 'USD') {
      this.subtotal_final = subtotalMXN / this.cotizacion.tipo_cambio;
      this.iva_final = (subtotalMXN * 0.16) / this.cotizacion.tipo_cambio;
      this.total_final = (subtotalMXN * 1.16) / this.cotizacion.tipo_cambio;
    } else {
      this.subtotal_final = subtotalMXN;
      this.iva_final = subtotalMXN * 0.16;
      this.total_final = subtotalMXN * 1.16;
    }
  }

  irACot() {
    this.router.navigate(['/cotizaciones']);
  }

}
