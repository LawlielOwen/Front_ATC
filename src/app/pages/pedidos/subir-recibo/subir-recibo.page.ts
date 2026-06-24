import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { toast } from 'ngx-sonner';
import { NgxSonnerToaster } from 'ngx-sonner';
import { UploadModalComponent } from "../../../shared/components/UI/modal/upload-modal/upload-modal.component";

import { PedidoService } from '../../../core/services/Pedidos.service'
@Component({
  selector: 'app-subir-recibo',
  templateUrl: './subir-recibo.page.html',
  styleUrls: ['./subir-recibo.page.scss'],
  standalone: true,
   imports: [
    CommonModule,
    IonicModule,
    HeaderModalComponent,
    FooterModalComponent,
    ButtonActionComponent,
    NgxSonnerToaster,
    UploadModalComponent 
  ]
})
export class SubirReciboPage implements OnInit {
archivoSeleccionado: File | undefined = undefined;
  guardando: boolean = false;
  constructor(private ps: PedidoService,public dialog: MatDialog,public dialogRef: MatDialogRef<SubirReciboPage>,@Inject(MAT_DIALOG_DATA) public data: any ) { }

  ngOnInit() {
  }
 cerrar() {
    this.dialogRef.close(false);
  }
 onArchivoSeleccionado(file: File | undefined) {
    this.archivoSeleccionado = file;
  }

  subirRecibo() {
    // 1. Validar que exista un archivo y un ID de pedido
    if (!this.archivoSeleccionado) {
      toast.error('Por favor, selecciona un archivo PDF primero.');
      return;
    }

    if (!this.data || !this.data.idPedido) {
      toast.error('Error interno: No se encontró el ID del pedido.');
      return;
    }

    this.guardando = true;

    // 2. Llamar al servicio, pasándole el ID y el archivo
    this.ps.subirFactura(this.data.idPedido, this.archivoSeleccionado).subscribe({
      next: (res) => {
        this.guardando = false;
        // Cerramos el modal enviando "true" para que la tabla sepa que debe recargarse
this.dialogRef.close({ subido: true, mensaje: res.mensaje });      },
      error: (err) => {
        console.error('Error al subir el recibo:', err);
        toast.error('No se pudo subir el recibo. Inténtalo de nuevo.');
        this.guardando = false;
      }
    });
  }
}
