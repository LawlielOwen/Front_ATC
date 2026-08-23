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
import { mostrarAvisoStockIncompleto, mostrarExitoPedido } from '../../../shared/utils/pedido-alerts.util';
import Swal from 'sweetalert2';
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
  actualizoAlgo: boolean = false;
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  monedaActual: string = 'MXN';

  constructor(
    private ps: PedidoService,
    public dialogRef: MatDialogRef<DetallePedidoPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, public authService: AuthService,
    public dialog: MatDialog
  ) {
    this.ped = data.detalles;
  }

  ngOnInit() {
    this.cargarDetalles();
  }

  cerrar() {
    this.dialogRef.close(this.actualizoAlgo);
  }

  cargarDetalles() {
    this.cargando = true;
    this.ps.obtenerDetallesPedido(this.ped.id).subscribe({
      next: (res: any) => {
        this.pedidoDetalle = res;

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
      this.subtotal += Number(item.importe);
    });

    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }

  formatearDinero(cantidad: number, ocultarLetras: boolean = false): string {
    let codigoDivisa = this.monedaActual;

    if (codigoDivisa === 'MONEDA NACIONAL') {
      codigoDivisa = 'MXN';
    }

    const opciones: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: codigoDivisa
    };

    if (ocultarLetras) {
      (opciones as any).currencyDisplay = 'narrowSymbol';
    }

    return new Intl.NumberFormat('es-MX', opciones).format(cantidad);
  }
 recargarPedidoCompleto() {
    this.ps.obtenerDetallesPedido(this.ped.id).subscribe({
      next: (pedidoActualizado: any) => {
        this.ped = {
          ...this.ped,          
          ...pedidoActualizado,  
          estatusTexto: this.obtenerTextoEstatus(pedidoActualizado.Estatus)
        };
        this.cargarDetalles();
      },
      error: (err) => {
        console.error('Error al refrescar el pedido:', err);
        this.cargarDetalles();
      }
    });
  }
   obtenerTextoEstatus(estatus: number): string {
    const mapaEstatus: Record<number, string> = {
      0: 'Cancelado',
      1: 'Pendiente',
      2: 'Completado',
      3: 'Incompleto'
    };
    return mapaEstatus[estatus] || 'Desconocido';
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
        this.actualizoAlgo = true; 

        if (mensajeBackend.toLowerCase().includes('incompleto')) {
            mostrarAvisoStockIncompleto(mensajeBackend).then(() => {
              this.recargarPedidoCompleto();
            });
        } else {
            mostrarExitoPedido(mensajeBackend || 'Archivo subido y pedido completado correctamente.').then(() => {
              this.dialogRef.close(true);
            });
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

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  validarYCompletar() {
    this.ps.aceptarPedido(this.ped.id).subscribe({
      next: (res: any) => {
        toast.success(res.mensaje || '¡Pedido completado!');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al validar/completar pedido:', err);
        const mensajeError = err.error?.error || 'No se pudo completar el pedido. Verifica el stock y la factura.';
        toast.error(mensajeError);
      }
    });
  }
pagarConCredito() {

    if (this.monedaActual === 'USD') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible en esta moneda',
        text: 'El pago con línea de crédito no está disponible para pedidos en USD. Usa "Subir Recibo" para este pedido.',
        confirmButtonColor: '#003B8A',
        heightAuto: false
      });
      return;
    }

    Swal.fire({
      icon: 'question',
      title: '¿Pagar con Línea de Crédito?',
      html: `
        <p style="font-size: 14px; color: #475569; margin-bottom: 0;">
          Se intentará cobrar el total de este pedido descontándolo directamente del límite de crédito autorizado del cliente.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, cobrar de crédito',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981', 
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.ps.pagarConCredito(this.ped.id).subscribe({
          next: (res: any) => {
            const mensajeBackend = res.mensaje || '';
            this.actualizoAlgo = true;

            if (mensajeBackend.toLowerCase().includes('incompleto')) {
              mostrarAvisoStockIncompleto(mensajeBackend).then(() => {
                this.recargarPedidoCompleto();
              });
            } else {
              mostrarExitoPedido(mensajeBackend || 'El cobro se aplicó exitosamente al crédito del cliente.').then(() => {
                this.dialogRef.close(true);
              });
            }
          },
          error: (err) => {
            console.error('Error al cobrar con crédito:', err);
            const mensajeError = err.error?.error || 'No se pudo procesar el pago con crédito.';

            if (mensajeError.toLowerCase().includes('crédito insuficiente') || mensajeError.toLowerCase().includes('credito insuficiente')) {
              Swal.fire({
                icon: 'warning',
                title: 'Crédito Insuficiente',
                text: mensajeError,
                confirmButtonColor: '#003B8A',
                heightAuto: false
              });
              return;
            }

            Swal.fire({
              icon: 'error',
              title: 'Cobro Rechazado',
              text: mensajeError,
              confirmButtonColor: '#003B8A',
              heightAuto: false
            });
          }
        });
      }
    });
}
}