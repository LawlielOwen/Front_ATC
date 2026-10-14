import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../../core/services/Productos.service'
import { ModalProductoPage } from "../modal-producto/modal-producto.page";
import {confirmarEliminarProducto,confirmarActivarProducto} from '../../../shared/utils/producto-alerts.util';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { Productos } from '../../../shared/model/productos.model';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detalles-producto',
  templateUrl: './detalles-producto.page.html',
  styleUrls: ['./detalles-producto.page.scss'],
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
export class DetallesProductoPage implements OnInit {
  producto!: Productos;
  constructor(
    private dialogRef: MatDialogRef<DetallesProductoPage>,
    private dialog: MatDialog, private pr: ProductoService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,public authService: AuthService
  ) {
    if (this.data && this.data.producto) {
      this.producto = this.data.producto;
    }
  }

  ngOnInit() {
  }

  cerrarDetalle() {
    this.dialogRef.close();
  }

  procesarFuncion() {
    if (this.producto.Estatus === 1) {
      this.eliminarProducto(this.producto.id);
    } else {
      this.activarProducto(this.producto.id);
    }

  }

abrirModalEdicion(productoAEditar: any) {
    const dialogRef = this.dialog.open(ModalProductoPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: { producto: productoAEditar } 
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true);
      }
    });
  }
  async eliminarProducto(id: number) {
  const confirmado = await confirmarEliminarProducto();
  if (!confirmado) return;

  this.pr.deleteProducto(id).subscribe({
    next: (response: any) => {
      this.dialogRef.close(true);
      toast.success(response?.mensaje || 'Producto dado de baja correctamente');
    },
    error: (err) => {
      console.error('Error al dar de baja producto:', err);
      toast.error(err.error?.error || 'No se pudo dar de baja el producto');
    }
  });
}
 async activarProducto(id: number) {
  const confirmado = await confirmarActivarProducto();
  if (!confirmado) return;

  this.pr.activateProducto(id).subscribe({
    next: (response: any) => {
      this.dialogRef.close(true);
      toast.success(response?.mensaje || 'Producto activado correctamente');
    },
    error: (err) => {
      console.error('Error al activar producto:', err);
      toast.error(err.error?.error || 'No se pudo activar el producto');
    }
  });
}
}
