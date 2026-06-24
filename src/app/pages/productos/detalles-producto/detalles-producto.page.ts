import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../../core/services/Productos.service'
import { ModalProductoPage } from "../modal-producto/modal-producto.page";

// Importa aquí tus componentes Standalone (asegúrate de que las rutas coincidan con tu proyecto)
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
  eliminarProducto(id: number) {
    this.pr.deleteProducto(id).subscribe({
      next: (response: any) => {
        this.dialogRef.close(true);
        toast.success('Producto eliminado correctamente');
      }
    });
  }
  activarProducto(id: number) {
    this.pr.activateProducto(id).subscribe({
      next: (response: any) => {
        this.dialogRef.close(true);
        toast.success('Producto activado correctamente');
      }
    });
  }
}
