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
    const usuarioString = localStorage.getItem('user');
    let idAsesor = usuarioString ? JSON.parse(usuarioString).id : null;
    if (!this.solicitud.id_cliente) {
      toast.error('Selecciona un cliente destino');
      return;
    }

    const productosValidos = this.productosSolicitados
      .filter(p => p.codigo && p.piezas > 0)
      .map(p => ({
        id_producto: p.id_producto || 0,
        piezas: p.piezas
      }));

    if (productosValidos.length === 0) {
      toast.error('Agrega al menos un producto válido');
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
    fila.codigo = codigoEscrito;
    if (!codigoEscrito || codigoEscrito.length < 3) {
      fila.modelo = '';
      fila.id_producto = null;
      return;
    }
    if (fila.timeoutId) {
      clearTimeout(fila.timeoutId);
    }
    fila.buscando = true;
    fila.timeoutId = setTimeout(() => {

      this.valeService.buscarProductos(codigoEscrito).subscribe({
        next: (respuesta: any) => {
          fila.buscando = false;
          const productosEncontrados = respuesta.data || respuesta;

          if (productosEncontrados && productosEncontrados.length > 0) {
            const producto = productosEncontrados[0];
            fila.id_producto = producto.id;
            fila.Nombre = producto.Nombre;
            fila.Modelo = producto.Modelo;
          } else {
            fila.id_producto = null;
            fila.modelo = 'Producto no encontrado';
          }
        },
        error: (err) => {
          console.error(err);
          fila.buscando = false;
          fila.modelo = 'Error de conexión';
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
