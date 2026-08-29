import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import Swal from 'sweetalert2';
import { VisitaService } from '../../../core/services/Visitas.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";

// Importa los componentes de tus modales de acción (Ajusta las rutas según tu proyecto)
import { DeleteComponent } from '../../../shared/components/UI/modal/delete/delete.component';
import { CompletarVisitaPage } from '../completar-visita/completar-visita.page'; 

@Component({
  selector: 'app-detalle-visita',
  templateUrl: './detalle-visita.page.html',
  styleUrls: ['./detalle-visita.page.scss'],
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
export class DetalleVisitaPage implements OnInit {
  visita: any;
  demosDetalle: any[] = [];
  cargando: boolean = true;

  constructor(
    private vs: VisitaService,
    public dialogRef: MatDialogRef<DetalleVisitaPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public dialog: MatDialog,
    public authService: AuthService // <--- Inyectamos el AuthService para validar permisos
  ) {
    this.visita = data.visita;
  }

  ngOnInit() {
    this.cargarDemosDeVisita();
  }

  cargarDemosDeVisita() {
    this.cargando = true;
    const idVisita = this.visita.id_visita || this.visita.id; 

    this.vs.obtenerDetallesVisita(idVisita).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) this.demosDetalle = res;
        else if (res.data && Array.isArray(res.data)) this.demosDetalle = res.data;
        else this.demosDetalle = Object.values(res).find(Array.isArray) || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los detalles', err);
        this.cargando = false;
      }
    });
  }

  cerrarModal() {
    this.dialogRef.close(false);
  }

  getTotalPiezas(): number {
    return this.demosDetalle.reduce((total, item) => total + (Number(item.cantidad) || 0), 0);
  }

  completarVisita() {
    const dialogRef = this.dialog.open(CompletarVisitaPage, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { visita: this.visita }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true); 
      }
    });
  }

  cancelarVisita() {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Cancelar Visita',
        mensaje: `¿Estás seguro de que deseas cancelar la visita a "${this.visita.empresa_destino}"? Esta acción no se puede deshacer.`,
        textoAceptar: 'Cancelar Visita',
        textoCancelar: 'Regresar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        const idVisita = this.visita.id_visita || this.visita.id;
        
        this.vs.cancelarVisita(idVisita).subscribe({
          next: () => {
            toast.success('Visita cancelada correctamente');
            this.dialogRef.close(true);
          },
          error: () => toast.error('Error al cancelar la visita')
        });
      }
    });
  }
abrirPdf(idVisita: number) {
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

    this.vs.generarPDFVisita(idVisita).subscribe({
      next: (blob: Blob) => {
        Swal.close();

        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(pdfBlob);

        // Abrimos la ventana hasta que el Blob está listo
        const nuevaVentana = window.open('', '_blank');

        if (nuevaVentana) {
          nuevaVentana.document.open();
          nuevaVentana.document.write(`
            <html>
              <head><title>Visita PDF</title></head>
              <body style="margin: 0; padding: 0; overflow: hidden; height: 100vh;">
                <embed src="${fileURL}" type="application/pdf" width="100%" height="100%" style="border: none;" />
              </body>
            </html>
          `);
          nuevaVentana.document.close();
        } else {
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
}