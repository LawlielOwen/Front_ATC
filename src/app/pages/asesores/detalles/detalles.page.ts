import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { toast } from 'ngx-sonner';
import { ModalAsesorPage } from '../modal-asesor/modal-asesor.page';
import { DeleteComponent } from '../../../shared/components/UI/modal/delete/delete.component';
import { AsesoresService } from "../../../core/services/Asesores.service";

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.page.html',
  styleUrls: ['./detalles.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    HeaderModalComponent,
    FooterModalComponent,
    ButtonActionComponent
  ]
})
export class DetallesPage implements OnInit {
  asesor: any;

  constructor(
    private dialogRef: MatDialogRef<DetallesPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private asesorService: AsesoresService
  ) { }

  ngOnInit() {
    // Recibimos el objeto que nos mandó la tabla
    if (this.data && this.data.asesor) {
      this.asesor = this.data.asesor;
    }
  }

  cerrar(recargarTabla: boolean = false) {
    this.dialogRef.close(recargarTabla);
  }

  editar() {
    const dialogRef = this.dialog.open(ModalAsesorPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: this.asesor 
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cerrar(true);
      }
    });
  }

  desactivar() {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '450px',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { 
        titulo: 'Desactivar Asesor', 
        mensaje: `¿Estás seguro de que deseas dar de baja a ${this.asesor.Nombre_completo}? Perderá el acceso al sistema.` 
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.asesorService.deleteAsesor(this.asesor.id).subscribe({
          next: () => {
            toast.success('Asesor desactivado correctamente');
            this.cerrar(true);
          },
          error: (err) => {
            console.error('Error al desactivar:', err);
            toast.error(err.error?.error || 'Ocurrió un error al intentar desactivar el asesor.');
          }
        });
      }
    });
  }
}