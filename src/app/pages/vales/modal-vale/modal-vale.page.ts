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
import {ClientesService} from '../../../core/services/clientes.service';
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
  productosSolicitados: any[] = [];
  clientesFiltrados: any[] = [];
  clientes: any[] = [];
  constructor(private dialogRef: MatDialogRef<ModalValePage>,
    private valeService: ValeService, private cs: ClientesService) { }

  ngOnInit() {
    this.agregarFilaProducto();
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
  }
  agregarFilaProducto() {
    this.productosSolicitados.push({
      id_producto: null,
      Nombre: '',
      codigo: '',
      modelo: '',
      descripcion: '',
      piezas: 1,
      buscando: false,
      timeoutId: null
    });
  }
  eliminarFila(index: number) {
    this.productosSolicitados.splice(index, 1);
    if (this.productosSolicitados.length === 0) {
      this.agregarFilaProducto();
    }
  }
  cerrar() {
    this.dialogRef.close();
  }
guardarSolicitud() {
    // ✦ 1. VALIDACIÓN DE SESIÓN (Asesor responsable)
    const usuarioString = localStorage.getItem('user');
    let idAsesor = usuarioString ? JSON.parse(usuarioString).id : null;

    if (!idAsesor) {
      toast.error('Error de sesión. Inicia sesión nuevamente.');
      return;
    }

    // ✦ 2. VALIDACIÓN DE CLIENTE DESTINO
    if (!this.solicitud.id_cliente) {
      toast.error('Selecciona un cliente destino');
      return;
    }

    // ✦ 3. VALIDACIÓN ESTRICTA DE ORDEN DE COMPRA
    const ordenLimpia = (this.solicitud.orden_compra || '').toString().trim();
    if (!ordenLimpia) {
      toast.error('La Orden de Compra es obligatoria.');
      return;
    }
    this.solicitud.orden_compra = ordenLimpia;
    
    this.solicitud.num_factura = (this.solicitud.num_factura || '').toString().trim();

    const productosValidos = [];

    for (let i = 0; i < this.productosSolicitados.length; i++) {
      const p = this.productosSolicitados[i];

      if (p.id_producto) {
        const cantidadNum = Number(p.piezas);

        if (isNaN(cantidadNum) || !Number.isInteger(cantidadNum) || cantidadNum <= 0) {
          toast.error(`Error en la fila ${i + 1}: La cantidad debe ser un número entero mayor a 0.`);
          return; 
        }

        productosValidos.push({
          id_producto: p.id_producto,
          piezas: cantidadNum
        });
      }
    }

    if (productosValidos.length === 0) {
      toast.error('Agrega al menos un producto válido a la solicitud.');
      return;
    }

    const payload = {
      id_asesor: idAsesor,
      id_cliente: parseInt(this.solicitud.id_cliente),
      orden_compra: this.solicitud.orden_compra,
      num_factura: this.solicitud.num_factura,
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
buscarProductoBD(codigoEscrito: string, index: number) {
    const fila = this.productosSolicitados[index];
    
    // Limpieza de espacios en blanco
    const codigoLimpio = (codigoEscrito || '').toString().trim();
    fila.codigo = codigoLimpio;

    if (!codigoLimpio || codigoLimpio.length < 3) {
      fila.Nombre = '';
      fila.Modelo = '';
      fila.id_producto = null;
      return;
    }

    if (fila.timeoutId) {
      clearTimeout(fila.timeoutId);
    }

    fila.buscando = true;
    fila.timeoutId = setTimeout(() => {

      this.valeService.buscarProductos(codigoLimpio).subscribe({
        next: (respuesta: any) => {
          fila.buscando = false;
          const productosEncontrados = respuesta.data || respuesta;

          if (productosEncontrados && productosEncontrados.length > 0) {
            const producto = productosEncontrados[0];
            fila.id_producto = producto.id;
            fila.Nombre = producto.Nombre;
            fila.Modelo = producto.Modelo;
          } else {
            // CASO: La BD responde correctamente pero no hay coincidencias
            fila.id_producto = null;
            fila.Nombre = 'Producto no encontrado';
            fila.Modelo = '';
            toast.warning(`No se encontró el código "${codigoLimpio}".`);
          }
        },
        error: (err) => {
          console.error(err);
          fila.buscando = false;
          
          // CASO: El backend arroja un error 404
          if (err.status === 404) {
            fila.id_producto = null;
            fila.Nombre = 'Producto no encontrado';
            fila.Modelo = '';
            toast.warning(`No se encontró el código "${codigoLimpio}".`);
          } else {
            fila.id_producto = null;
            fila.Nombre = 'Error de conexión';
            fila.Modelo = '';
            toast.error('Hubo un problema al comunicarse con el servidor.');
          }
        }
      });

    }, 500);
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
