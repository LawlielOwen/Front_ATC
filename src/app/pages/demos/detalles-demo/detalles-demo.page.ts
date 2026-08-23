import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ModalDemoPage } from "../modal-demo/modal-demo.page";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { DemoService } from '../../../core/services/Demos.service';
import { StockDemo } from '../../../shared/model/demo.model';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../core/services/auth.service';
import { DeleteComponent } from '../../../shared/components/UI/modal/delete/delete.component';

@Component({
  selector: 'app-detalles-demo',
  templateUrl: './detalles-demo.page.html',
  styleUrls: ['./detalles-demo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderModalComponent,
    FooterModalComponent,
    CardDetailsComponent,
    ButtonActionComponent,
  ]
})
export class DetallesDemoPage implements OnInit {
  demo!: StockDemo;

  constructor(
    private dialogRef: MatDialogRef<DetallesDemoPage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private ds: DemoService,
    public authService: AuthService
  ) { 
    if (this.data && this.data.demo) {
      this.demo = this.data.demo;
    }
  }

  ngOnInit() {
  }

  cerrarDetalle() {
    this.dialogRef.close();
  }

  abrirModalEdicion(demoAEditar: any) {
    const dialogRef = this.dialog.open(ModalDemoPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: { demo: demoAEditar }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true); 
      }
    });
  }

  procesarFuncion() {
    if (this.demo.estatus === 0) {
      this.ds.activarDemo(this.demo.id_demo).subscribe({
        next: () => {
          toast.success('Equipo Demo reactivado correctamente');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          toast.error('Error al reactivar el equipo demo');
        }
      });
    } else {
      const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Eliminar Equipo Demo',
        mensaje: `¿Estás seguro de que deseas eliminar el demo"${this.demo.nombre_modelo}"?`,
        textoAceptar: 'Eliminar',
        textoCancelar: 'Regresar'
      }
    });
      this.ds.eliminarDemo(this.demo.id_demo).subscribe({
        next: () => {
          toast.success('Equipo Demo dado de baja correctamente');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          toast.error('Error al dar de baja el equipo demo');
        }
      });
    }
  }
}