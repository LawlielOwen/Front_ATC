import { Component, OnInit, Inject} from '@angular/core';
import {EstatusComponent} from '../../../shared/components/UI/estatus/estatus.component';
import {IonicModule} from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../shared/model/clientes.model';
import { ClientesService } from "../../../core/services/clientes.service";
import { toast } from 'ngx-sonner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {FooterModalComponent} from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import {ButtonActionComponent} from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { RegimenFiscalPipe } from "./regimen-fiscal-pipe";
import { MatDialog } from '@angular/material/dialog';
import { ModalClientePage } from "../modal-cliente/modal-cliente.page";
import {CardDetailsComponent} from "../../../shared/components/UI/modal/card-details/card-details.component";
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detalles-cliente',
  templateUrl: './detalles-cliente.page.html',
  styleUrls: ['./detalles-cliente.page.scss'],
  standalone: true,
  imports: [EstatusComponent, IonicModule, CommonModule,
     FooterModalComponent, ButtonActionComponent,RegimenFiscalPipe,
    CardDetailsComponent]

})
export class DetallesClientePage implements OnInit {

constructor(
    private dialogRef: MatDialogRef<DetallesClientePage>,
    @Inject(MAT_DIALOG_DATA) public cliente: Cliente,
    private clientesService: ClientesService, public dialog: MatDialog,public authService: AuthService
  ) { }

  ngOnInit() {
  }
cerrarDetalle() {
    this.dialogRef.close();
  }
eliminarCliente(id: number) {
    this.clientesService.deleteCliente(id).subscribe({
      next: (response: any) => {
        this.dialogRef.close(true);
        toast.success('Cliente eliminado correctamente');
      }
    });
  }
activarCliente(id: number) {
    this.clientesService.activateCliente(id).subscribe({
      next: (response: any) => {
        this.dialogRef.close(true);
        toast.success('Cliente activado correctamente');
      }
    });
  }
  procesarFuncion(){
    if(this.cliente.Estatus === 1){
      this.eliminarCliente(this.cliente.id);
    } else{
      this.activarCliente(this.cliente.id);
    }
  }
descargarPDF() {
    if (!this.cliente.ruta_constancia) {
      console.error('No hay un archivo válido para descargar');
      return;
    }
    const url = this.clientesService.obtenerUrlArchivo(this.cliente.ruta_constancia);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = this.cliente.nombre_constancia; 
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  truncarNombre(nombre: string, maxChars: number = 30): string {
    if (!nombre || nombre.length <= maxChars) return nombre;
    const ext = nombre.lastIndexOf('.');
    const extension = ext !== -1 ? nombre.substring(ext) : '';
    return nombre.substring(0, maxChars - extension.length) + '…' + extension;
}
 abrirModalEdicion(clienteAEditar: any) {
  const dialogRef = this.dialog.open(ModalClientePage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
    data: clienteAEditar 
    
  });
dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true);
      }
    });
}
abrirModalActualizarCsf(cliente: any) {
    const dialogRef = this.dialog.open(ModalClientePage, {
      data: {
        modo: 'updateCsf',
        width: '630px',
        maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
        cliente: cliente
      }
    });

  dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.dialogRef.close(true);
      }
    });
  }
}


