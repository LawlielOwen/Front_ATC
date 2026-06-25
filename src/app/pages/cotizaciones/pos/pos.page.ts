import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { toast } from 'ngx-sonner';

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
    IonicModule,  HeaderComponent, NgxSonnerToaster, FormsModule, CommonModule, MatAutocompleteModule,MatInputModule,
    MatFormFieldModule,ReactiveFormsModule,
  ]
})
export class POSPage implements OnInit {
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
  constructor(private cs: CotizacionService,private c: ClientesService,private router: Router,private service: AsesoresService,
    
  ) { }
 
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
  }
 cargarAsesores() {
    this.service.getAsesores().subscribe({
      next: (response: any) => {
        this.asesores = response.filter((asesor: Asesor) => asesor.Rol === 'Asesor');
        
        // CORRECCIÓN: Solo asignamos el asesor si 'this.data' existe
        if (this.data && this.data.id_asesor) {
           this.cotizacion.id_asesor = this.data.id_asesor.toString();
        }
      },
      error: (err) => console.error('Error al cargar asesores', err)
    });
  }
  onEnterProducto(event: any) {
  const termino = event.target.value?.trim();
  if (!termino) return;

  // Si el autocompletado ya encontró exactamente UN producto, lo agregamos directo
  if (this.productosFiltrados.length === 1) {
    this.seleccionarProducto(this.productosFiltrados[0]);
  } else if (this.productosFiltrados.length > 1) {
    toast.info('Por favor, selecciona un producto de la lista desplegada.');
  }
}
 seleccionarProducto(producto: any) {
  this.agregarItem(producto);
  
  // UX Clave: Limpiamos el buscador inmediatamente para que quede listo para el siguiente producto
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
      cantidad_producto: 1,
      precio_unitario_cotizado: productoDB.Precio,
      extra_descripcion: '', // El usuario lo llenará si quiere
      tiempo_entrega: '' // Valor por defecto
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

    Swal.fire({
      title: 'Procesando...',
      text: 'Guardando cotización y generando PDF',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading(); // Muestra el spinner animado
      }
    });    
    // 2. Armamos el paquete
    const payload = {
      ...this.cotizacion,
      subtotal: this.subtotal_final,
      iva: this.iva_final,
      total: this.total_final,
      detalles: this.detalles
    };

    // 3. Guardamos en la Base de Datos
    this.cs.crearCotizacion(payload).subscribe({
      next: (res: any) => {
        const nuevoId = res.id_cotizacion; 

        this.cs.descargarPDF(nuevoId).subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Cotizacion_ATC.pdf`; // Opcional: puedes poner res.folio si el backend te lo devuelve
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            Swal.close();
    
            this.limpiarFormulario();
          },
          error: () => {
            toast.error('Se guardó la cotización, pero falló el PDF.');
            this.limpiarFormulario();
          }
        });
      },
      error: (err) => toast.error('Error al guardar la cotización')
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

    const payload = {
      ...this.cotizacion,
      subtotal: this.subtotal_final,
      iva: this.iva_final,
      total: this.total_final,
      detalles: this.detalles
    };

    this.cs.crearCotizacion(payload).subscribe({
      next: (res) => {
        toast.success('Cotización creada con éxito. Folio generado.');
        this.limpiarFormulario();
      },
      error: (err) => toast.error('Error al guardar la cotización')
    });
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
    return cliente ? (cliente.nombre || cliente.Nombre || '') : '';
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
