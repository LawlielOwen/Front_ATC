import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

import { ProveedorService } from '../../../core/services/Proveedores.service';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { ConfirmarRecepcionPage } from "../confirmar-recepcion/confirmar-recepcion.page"
@Component({
  selector: 'app-detalles-recepcion',
  templateUrl: './detalles-recepcion.page.html',
  styleUrls: ['./detalles-recepcion.page.scss'],
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
export class DetallesRecepcionPage implements OnInit {
  pedido: any;
  productosDetalle: any[] = [];
  incidentesDetalle: any[] = []
  cargando: boolean = true;

  constructor(
    private ps: ProveedorService,
    public dialogRef: MatDialogRef<DetallesRecepcionPage>,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog
  ) {
    this.pedido = data.pedido;
  }

  ngOnInit() {
    this.cargarDetallesDelPedido();
    if (this.pedido.Estatus === 2) {
      this.cargarIncidentesDelPedido();
    }
  }

  cargarDetallesDelPedido() {
    this.cargando = true;
    this.ps.consultarDetallesPedido(this.pedido.id_pedido).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.productosDetalle = res;
        }
        else if (res.data && Array.isArray(res.data)) {
          this.productosDetalle = res.data;
        }

        else {
          this.productosDetalle = Object.values(res).find(Array.isArray) || [];
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los detalles', err);
        this.cargando = false;
      }
    });
  }
cargarIncidentesDelPedido() {
    this.ps.consultarIncidentesPedido(this.pedido.id_pedido).subscribe({
      next: (res: any) => {
        let incidentes = [];
        if (Array.isArray(res)) {
          incidentes = res;
        } else if (res.data && Array.isArray(res.data)) {
          incidentes = res.data;
        } else {
          incidentes = Object.values(res).find(Array.isArray) || [];
        }

        this.incidentesDetalle = incidentes;
        if (this.incidentesDetalle.length > 0 && !this.pedido.descripcion_incidencia) {
          this.pedido.descripcion_incidencia = this.incidentesDetalle[0].Descripcion;
        }
      },
      error: (err) => {
        console.error('Error al cargar los incidentes', err);
      }
    });
  }
  cerrarModal() {
    this.dialogRef.close(false);
  }

 recibirPedido(pedido: any) {
    const dialogRef = this.dialog.open(ConfirmarRecepcionPage, {
      width: '750px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: {
        pedido: pedido, 
        productos: this.productosDetalle // Mandamos la tabla de productos que ya cargaste en este modal
      }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true);
      }
    });
  }
  getTotalPiezas(): number {
    return this.productosDetalle.reduce((total, item) => total + (item.cantidad || 0), 0);
  }
}