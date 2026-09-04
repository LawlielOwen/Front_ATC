import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { DeleteComponent } from '../../../shared/components/UI/modal/delete/delete.component';
import { AceptarComponent } from '../../../shared/components/UI/modal/aceptar/aceptar.component';
import { toast } from 'ngx-sonner';
import { ModalClientePage } from '../../clientes/modal-cliente/modal-cliente.page'
import { CotizacionService } from '../../../core/services/Cotizaciones.service'
import { NgxSonnerToaster } from 'ngx-sonner';
import { Router } from '@angular/router';
import { solicitarOrdenCompra, confirmarRegistroCliente } from '../../../shared/utils/cotizacion-alerts.util';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detalles-cotizacion',
  templateUrl: './detalles-cotizacion.page.html',
  styleUrls: ['./detalles-cotizacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderModalComponent,
    FooterModalComponent,
    CardDetailsComponent,
    ButtonActionComponent,
    NgxSonnerToaster
  ]
})
export class DetallesCotizacionPage implements OnInit {
  cotizacionDetalle: any[] = [];
  cot: any;
  cargando: boolean = true;

  constructor(
    private cs: CotizacionService, private router: Router,
    public dialogRef: MatDialogRef<DetallesCotizacionPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public authService: AuthService
  ) {
    this.cot = data.cot;
  }

  ngOnInit() {
    this.cargarDetallesCot();
  }
  cerrar() {
    this.dialogRef.close(false);
  }
cargarDetallesCot() {
    this.cargando = true;
    this.cs.obtenerCotizacionPorId(this.cot.id).subscribe({
      next: (res: any) => {
        let detallesCrudos = [];
        if (Array.isArray(res)) {
          detallesCrudos = res;
        } else if (res.data && Array.isArray(res.data)) {
          detallesCrudos = res.data;
        } else {
          detallesCrudos = Object.values(res).find(Array.isArray) || [];
        }

        const formateador = new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: this.cot.moneda === 'USD' ? 'USD' : 'MXN',
          currencyDisplay: 'narrowSymbol' as any
        });

        const esUSD = this.cot.moneda === 'USD';
        const factorConversion = (esUSD && this.cot.tipo_cambio > 0) ? Number(this.cot.tipo_cambio) : 1;

        this.cotizacionDetalle = detallesCrudos.map((item: any) => {
          const precioRaw = item.precio_unitario || item.precio_unitario_cotizado || 0;
          const fleteRaw = item.costo_flete || 0;

  
          const precioConvertido = Number(precioRaw) / factorConversion;
          const fleteConvertido = Number(fleteRaw) / factorConversion;
          const importeConvertido = (item.cantidad_producto * precioConvertido) + fleteConvertido;

          return {
            ...item,
            precio_formateado: formateador.format(precioConvertido),
            flete_formateado: formateador.format(fleteConvertido),
            importe_formateado: formateador.format(importeConvertido)
          };
        });

        this.cot.subtotal_formateado = formateador.format(this.cot.subtotal);
        this.cot.iva_formateado = formateador.format(this.cot.iva);

        this.cot.total_formateado_completo = new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: this.cot.moneda === 'USD' ? 'USD' : 'MXN',
          currencyDisplay: 'code'
        }).format(this.cot.total);

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los detalles', err);
        this.cargando = false;
      }
    });
}
  cancelarCotizacion(cot: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Cancelar Cotizacion',
        mensaje: `¿Estás seguro de que deseas cancelar la cotizacion?`,
        textoAceptar: 'Aceptar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.cs.cancelarCotizacion(cot.id).subscribe({
          next: (response: any) => {
            toast.success('Cotizacion cancelada');
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
  aceptarCotizacion(cot: any) {
    if (!cot.id_cliente) {
      confirmarRegistroCliente(cot.nombre_prospecto || cot.Cliente).then((deseaRegistrar) => {
        if (!deseaRegistrar) return;
        const nombreCliente = cot.nombre_cliente_final && cot.nombre_cliente_final !== 'Sin Nombre'
          ? cot.nombre_cliente_final
          : (cot.nombre_prospecto || cot.Cliente || '');
        const dialogRef = this.dialog.open(ModalClientePage, {
          width: '630px',
          maxWidth: '105vw',
          panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
          backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
          data: {
            nombrePrellenado: nombreCliente,
            idAsesorPrellenado: cot.id_asesor
          }
        });

        dialogRef.afterClosed().subscribe((nuevoIdCliente) => {
          if (nuevoIdCliente && typeof nuevoIdCliente === 'number') {
            solicitarOrdenCompra().then((ordenCompra) => {
              if (ordenCompra !== null) {
                this.vincularYConvertir(cot.id, nuevoIdCliente, ordenCompra);
              }
            });
          }
        });
      });

      return;
    }

    solicitarOrdenCompra().then((ordenCompra) => {
      if (ordenCompra !== null) {
        this.ejecutarConversionSp(cot.id, ordenCompra);
      }
    });
  }

  vincularYConvertir(idCotizacion: number, idNuevoCliente: number, orden_compra: string = '') {
    this.cs.vincularClienteCotizacion(idCotizacion, idNuevoCliente).subscribe({
      next: () => {
        this.ejecutarConversionSp(idCotizacion, orden_compra);
      },
      error: (err) => {
        toast.error('Error al vincular el cliente con la cotización.');
        console.error(err);
      }
    });
  }

  ejecutarConversionSp(idCotizacion: number, oc: string = '') {
    this.cs.convertirAPedido(idCotizacion, oc).subscribe({
      next: (response: any) => {
        toast.success('Cotización convertida a pedido exitosamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al aceptar', err);
        toast.error(err.error?.error || 'Error al convertir a pedido.');
      }
    });
  }
abrirPdf(idCotizacion: number) {
    // 1. Mostramos el loading primero
    Swal.fire({
      title: 'Generando documento...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      scrollbarPadding: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.cs.verPdfCotizacion(idCotizacion).subscribe({
      next: (blob: Blob) => {
        // 2. Cerramos el loading en cuanto llega el PDF
        Swal.close(); 

        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(pdfBlob);

        // 3. AHORA SÍ abrimos la ventana nueva
        const nuevaVentana = window.open('', '_blank');

        if (nuevaVentana) {
          // Si el navegador permitió abrir la ventana, inyectamos el PDF
          nuevaVentana.document.open();
          nuevaVentana.document.write(`
            <html>
              <head><title>Cotización PDF</title></head>
              <body style="margin: 0; padding: 0; overflow: hidden; height: 100vh;">
                <embed src="${fileURL}" type="application/pdf" width="100%" height="100%" style="border: none;" />
              </body>
            </html>
          `);
          nuevaVentana.document.close();
        } else {
          // Si el navegador bloqueó el pop-up, avisamos al usuario
          Swal.fire({
            icon: 'warning',
            title: 'Ventana bloqueada',
            text: 'Tu navegador bloqueó el PDF. Por favor, permite las ventanas emergentes (pop-ups) en la barra superior.',
            heightAuto: false,
            scrollbarPadding: false
          });
        }

        setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
      },
      error: (err) => {
        Swal.close();
        console.error('Error al obtener el PDF:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el documento.',
          heightAuto: false,
          scrollbarPadding: false
        });
      }
    });
  }
  modificarCotizacion(cot: any) {
    this.cerrar();
    this.router.navigate(['/cotizaciones/pos', cot.id], { state: { cotizacionData: cot } });
  }
}
