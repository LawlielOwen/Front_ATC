import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { DeleteComponent } from '../../../shared/components/UI/modal/delete/delete.component';
import { SubirReciboPage } from '../subir-recibo/subir-recibo.page'
import { PedidoService } from '../../../core/services/Pedidos.service';
import { toast } from 'ngx-sonner';
import { NgxSonnerToaster } from 'ngx-sonner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.page.html',
  styleUrls: ['./detalle-pedido.page.scss'],
  standalone: true,
  imports: [
    NgxSonnerToaster,
    CommonModule,
    IonicModule,
    HeaderModalComponent,
    FooterModalComponent,
    CardDetailsComponent,
    ButtonActionComponent
  ]
})
export class DetallePedidoPage implements OnInit {
  pedidoDetalle: any[] = [];
  ped: any;
  cargando: boolean = true;
  guardando: boolean = false;
  // Variables para los totales
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  monedaActual: string = 'MXN';

  constructor(
    private ps: PedidoService,
    public dialogRef: MatDialogRef<DetallePedidoPage>,
    @Inject(MAT_DIALOG_DATA) public data: any,public authService: AuthService,
    public dialog: MatDialog
  ) {
    // Los datos del encabezado del pedido
    this.ped = data.detalles;
  }

  ngOnInit() {
    this.cargarDetalles();
  }

  cerrar() {
    this.dialogRef.close(false);
  }

  cargarDetalles() {
    this.cargando = true;
    this.ps.obtenerDetallesPedido(this.ped.id).subscribe({
      next: (res: any) => {
        this.pedidoDetalle = res;

        // Si hay productos, extraemos la moneda (todos deberían tener la misma)
        if (this.pedidoDetalle.length > 0 && this.pedidoDetalle[0].moneda) {
          this.monedaActual = this.pedidoDetalle[0].moneda;
        }

        this.calcularTotales();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        toast.error('No se pudieron cargar los detalles del pedido.');
        this.cargando = false;
      }
    });
  }

  calcularTotales() {
    this.subtotal = 0;
    this.pedidoDetalle.forEach(item => {
      // Sumamos los importes crudos
      this.subtotal += Number(item.importe);
    });

    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }

  // Función auxiliar para darle formato al dinero
  // Si ocultarLetras es true, solo mostrará el símbolo "$"
  formatearDinero(cantidad: number, ocultarLetras: boolean = false): string {
    let codigoDivisa = this.monedaActual;

    if (codigoDivisa === 'MONEDA NACIONAL') {
      codigoDivisa = 'MXN';
    }

    // Configuración base para el formateador
    const opciones: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: codigoDivisa
    };

    // Si queremos ocultar "USD" o "MXN", forzamos a que el símbolo se muestre de forma estrecha ("$")
    if (ocultarLetras) {
      (opciones as any).currencyDisplay = 'narrowSymbol';
    }

    return new Intl.NumberFormat('es-MX', opciones).format(cantidad);
  }

 subirPDF() {
    const dialogRef = this.dialog.open(SubirReciboPage, {
      width: '650px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { idPedido: this.ped.id }
    });

    dialogRef.afterClosed().subscribe((resultado: any) => {
      if (resultado && resultado.subido) {
        
        const mensajeBackend = resultado.mensaje || '';

        if (mensajeBackend.includes('Advertencia')) {
            toast.warning(mensajeBackend);
            this.cargarDetalles();
            
        } else {
            toast.success(mensajeBackend || 'Archivo subido y pedido completado correctamente.');
            
            this.dialogRef.close(true); 
        }
      }
    });
  }

  cancelarPedido() {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Cancelar Pedido',
        mensaje: `¿Estás seguro de que deseas cancelar este pedido?`,
        textoAceptar: 'Aceptar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.ps.cancelarPedido(this.ped.id).subscribe({
          next: () => {
            toast.success('Pedido cancelado');
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Error al cancelar', err);
            toast.error('No se pudo cancelar');
          }
        });
      }
    });
  }
  verFactura() {
    if (!this.ped.factura_ruta) {
      toast.error('No hay ninguna factura adjunta a este pedido.');
      return;
    }
    
    const url = this.ps.obtenerUrlFactura(this.ped.factura_ruta);
    
    // Abrimos el PDF en una nueva pestaña (como lo hacías en clientes)
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    // Si quieres forzar descarga pon: link.download = this.ped.nombre_factura || 'factura.pdf';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  validarYCompletar() {
    // Si prefieres agregar un modal de confirmación antes de esto (como en cancelar), puedes hacerlo.
    // Aquí ejecutamos la acción directa:
    
    this.ps.aceptarPedido(this.ped.id).subscribe({
      next: (res: any) => {
        // Mostrar mensaje de éxito (puedes usar el que manda tu backend en res.mensaje)
        toast.success(res.mensaje || '¡Pedido completado!');
        
        // Cerramos el modal enviando "true" para que la vista principal recargue la tabla
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al validar/completar pedido:', err);
        
        const mensajeError = err.error?.error || 'No se pudo completar el pedido. Verifica el stock y la factura.';
        
        toast.error(mensajeError);
      }
    });
  }
}