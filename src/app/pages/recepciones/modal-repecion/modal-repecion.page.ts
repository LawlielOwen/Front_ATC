import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { DateComponent } from "../../../shared/components/UI/form/date/date.component";

import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../../core/services/Proveedores.service';
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
@Component({
  selector: 'app-modal-repecion',
  templateUrl: './modal-repecion.page.html',
  styleUrls: ['./modal-repecion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgxSonnerToaster,
    FooterModalComponent,
    HeaderModalComponent,
    ButtonActionComponent,
     DateComponent,
    CardFormComponent,
    FormsModule,
    SelectComponent,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class ModalRepecionPage implements OnInit {
productosSolicitados: any[] = [
    { codigo: '', id_producto: null, Nombre: '', pzas: 1, buscando: false, timeoutId: null }
  ];  
  pedidoNuevo = {
    id_asesor: null as any,
    id_proveedor: null as any,
    destino: '',
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
    { label: 'Fuji Electric', value: 9 }
  ];
  constructor(private ps: ProveedorService,
    private dialogRef: MatDialogRef<ModalRepecionPage>) { }

  ngOnInit() {
  }
 buscarProductoBD(codigoEscrito: string, index: number) {
    const fila = this.productosSolicitados[index];
    fila.codigo = codigoEscrito;

    if (!this.pedidoNuevo.id_proveedor) {
      if (codigoEscrito.length > 0) {
        toast.error('Primero debes seleccionar un proveedor en la parte superior.');
        fila.codigo = '';
      }
      return;
    }

    if (!codigoEscrito || codigoEscrito.length < 3) {
      fila.Nombre = ''; // <-- Cambiado de fila.modelo a fila.Nombre
      fila.id_producto = null;
      return;
    }

    if (fila.timeoutId) {
      clearTimeout(fila.timeoutId);
    }

    fila.buscando = true;
    fila.timeoutId = setTimeout(() => {

      this.ps.buscarProductos(codigoEscrito, this.pedidoNuevo.id_proveedor).subscribe({
        next: (respuesta: any) => {
          fila.buscando = false;
          const productosEncontrados = respuesta.data || respuesta;

          if (productosEncontrados && productosEncontrados.length > 0) {
            const producto = productosEncontrados[0];
            fila.id_producto = producto.id;
            // <-- Concatenamos Nombre y Modelo para mejor visualización
            fila.Nombre = `${producto.Nombre} - ${producto.Modelo}`; 
          } else {
            fila.id_producto = null;
            fila.Nombre = 'El producto no existe o no pertenece a este proveedor'; // <-- Corregido
            toast.error('El producto no existe o no pertenece a este proveedor');
          }
        },
        error: (err) => {
          console.error(err);
          fila.buscando = false;
          fila.Nombre = 'Error de conexión'; // <-- Corregido
        }
      });

    }, 500);
  }
  agregarFila() {
    this.productosSolicitados.push({
      codigo: '', id_producto: null, Nombre: '', cantidad: 1, buscando: false, timeoutId: null
    });
  }
  cerrar() {
    this.dialogRef.close();
  }
 guardarPedido() {
    const usuarioString = localStorage.getItem('user');
    let idAsesor = usuarioString ? JSON.parse(usuarioString).id : null;
    
    if (!this.pedidoNuevo.id_proveedor || !this.pedidoNuevo.fecha_estimada) {
      toast.error('Completa los datos del proveedor y la fecha.');
      return;
    }

    const productosValidos = this.productosSolicitados
      .filter(p => p.id_producto !== null && p.cantidad > 0) 
      .map(p => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad 
      }));

    if (productosValidos.length === 0) {
      toast.error('Agrega al menos un producto válido reconocido por el sistema');
      return;
    }
     const fechaObj = new Date(this.pedidoNuevo.fecha_estimada);
    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0'); // Añade un 0 si es menor a 10
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const fechaMySQL = `${anio}-${mes}-${dia}`;
     const payload = {
      id_asesor: idAsesor,
      id_proveedor: this.pedidoNuevo.id_proveedor,
      destino: this.pedidoNuevo.destino,
      fecha: fechaMySQL,
      productos: productosValidos // Esto se convertirá en p_productos_json en Node
    };

    // 3. Enviamos al servidor
    this.ps.registrarPedido(payload).subscribe({
      next: (response) => {
        toast.success('Pedido registrado exitosamente');
        this.dialogRef.close(true); // Cerramos y enviamos true para actualizar la tabla padre
      },
      error: (err) => {
        console.error(err);
        toast.error('Ocurrió un error al crear el pedido');
      }
    });
  }
  eliminarFila(index: number) {
    if (this.productosSolicitados.length > 1) {
      this.productosSolicitados.splice(index, 1);
    } else {
      toast.error('El pedido debe tener al menos un producto.');
    }
  }
}
