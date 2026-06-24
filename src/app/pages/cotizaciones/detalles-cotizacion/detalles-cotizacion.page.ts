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
import { CotizacionService } from '../../../core/services/Cotizaciones.service'
import Swal from 'sweetalert2';

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
    ButtonActionComponent
  ]
})
export class DetallesCotizacionPage implements OnInit {
  cotizacionDetalle: any[] = [];
  cot: any;
  cargando: boolean = true;

  constructor(
    private cs: CotizacionService,
    public dialogRef: MatDialogRef<DetallesCotizacionPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog
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

        // 1. Identificamos si es USD y obtenemos el tipo de cambio
        const esUSD = this.cot.moneda === 'USD';
        // Usamos el tipo de cambio de la cotización, si no hay o es 0, usamos 1 para no afectar el valor
        const factorConversion = (esUSD && this.cot.tipo_cambio > 0) ? Number(this.cot.tipo_cambio) : 1;

        this.cotizacionDetalle = detallesCrudos.map((item: any) => {
          const precioRaw = item.precio_unitario || item.precio_unitario_cotizado || 0;
          
          // 2. Aplicamos la conversión matemática
          const precioConvertido = Number(precioRaw) / factorConversion;
          const importeConvertido = (item.cantidad_producto * precioConvertido) || 0;

          return {
            ...item,
            // 3. Formateamos ya la cantidad dividida en dólares
            precio_formateado: formateador.format(precioConvertido),
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
    const dialogRef = this.dialog.open(AceptarComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Aceptar Cotizacion',
        mensaje: `¿Desear confirmar esta cotizacion como aceptada?`,
        textoAceptar: 'Aceptar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.cs.convertirAPedido(cot.id).subscribe({
          next: (response: any) => {
            toast.success('Cotizacion aceptada');

            this.dialogRef.close(true);

          },
          error: (err) => {
            console.error('Error al aceptar', err);
            toast.error('No se pudo aceptar');
          }
        });
      }
    });
  }
  abrirPdf(idCotizacion: number) {
    Swal.fire({
      title: 'Abriendo documento...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.cs.verPdfCotizacion(idCotizacion).subscribe({
      next: (blob: Blob) => {
        Swal.close();

        // 1. Tipamos el PDF
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(pdfBlob);

        // 2. CREAMOS UN ENLACE INVISIBLE (Esto evita el bloqueo del navegador)
        const a = document.createElement('a');
        a.href = fileURL;
        a.target = '_blank'; // Fuerza que se abra en otra pestaña

        // IMPORTANTE: NO ponemos a.download para que se visualice en lugar de descargarse
        document.body.appendChild(a);
        a.click(); // Simulamos el clic humano

        // 3. Limpieza de memoria
        document.body.removeChild(a);

        // Liberamos la URL después de unos segundos para que el navegador no gaste RAM
        setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
      },
      error: (err) => {
        Swal.close();
        console.error('Error al obtener el PDF:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el documento.'
        });
      }
    });
  }
}
