import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from "@ionic/angular";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { CardDetailsComponent } from "../../../shared/components/UI/modal/card-details/card-details.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { TicketService } from '../../../core/services/Tickets.service';
import { AuthService } from '../../../core/services/auth.service';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { ModalTicketPage } from '../modal-ticket/modal-ticket.page';

import { confirmarAvanceEstatus, solicitarDatosCierreTicket } from '../../../shared/utils/ticket-alerts.util';
@Component({
  selector: 'app-detalle-ticket',
  templateUrl: './detalle-ticket.page.html',
  styleUrls: ['./detalle-ticket.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule,
    HeaderModalComponent, FooterModalComponent, CardDetailsComponent, ButtonActionComponent,NgxSonnerToaster
  ]
})
export class DetalleTicketPage implements OnInit {

  ticket: any;
  procesando: boolean = false;

 private readonly FLUJO_ESTATUS: { [key: number]: { siguiente: number; texto: string; pregunta: string } } = {
    1: { 
      siguiente: 2, 
      texto: 'Contactado', 
      pregunta: '¿Ya lograste comunicarte con este cliente?' 
    },
    2: { 
      siguiente: 3, 
      texto: 'Cotizado', 
      pregunta: '¿Ya le enviaste la cotización al cliente?' 
    },
    3: { 
      siguiente: 4, 
      texto: 'Cerrado', 
      pregunta: ''
    },
  };
  constructor(
    public authService: AuthService,
    public ticketService: TicketService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DetalleTicketPage>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.ticket = data?.ticket ?? {};
  }

  ngOnInit() { }

  get textoBotonAvance(): string {
    const paso = this.FLUJO_ESTATUS[this.ticket?.estatus];
    if (!paso) return '';
    return paso.siguiente === 4 ? 'Cerrar Ticket' : `Marcar como ${paso.texto}`;
  }

  cerrarDetalle() {
    this.dialogRef.close(false);
  }

  formatearFecha(fechaStr: string) {
    if (!fechaStr) return 'Sin confirmar';
    return new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  abrirModificarTicket() {
    const dialogRef = this.dialog.open(ModalTicketPage, {
      width: '750px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { ticket: this.ticket }
    });

    dialogRef.afterClosed().subscribe((seModifico: boolean) => {
      if (seModifico) {
        this.dialogRef.close(true);
      }
    });
  }

  obtenerTextoEstatus(estatus: number): string {
    if (estatus === 1) return 'Asignado';
    if (estatus === 2) return 'Contactado';
    if (estatus === 3) return 'Cotizado';
    if (estatus === 4) return 'Cerrado';
    return 'N/A';
  }

  gestionarEstatus() {
    if (this.procesando || this.ticket.estatus === 4) return;

    const paso = this.FLUJO_ESTATUS[this.ticket.estatus];
    if (!paso) return;

    if (paso.siguiente === 4) {
      this.abrirFormularioCierre();
    } else {
      // Pasamos el nuevo parámetro "pregunta"
      this.confirmarAvance(paso.siguiente, paso.texto, paso.pregunta);
    }
  }

 private confirmarAvance(nuevoEstatus: number, textoEstatus: string, pregunta: string) {
    confirmarAvanceEstatus(pregunta, textoEstatus).then((confirmado) => {
      if (!confirmado) return;

      this.procesando = true;
      this.ticketService.cambiarEstatus(this.ticket.id_ticket, nuevoEstatus).subscribe({
        next: () => {
       
          this.ticket.estatus = nuevoEstatus;
          
          this.ticket.estatusTexto = this.obtenerTextoEstatus(nuevoEstatus);

          toast.success('Estatus actualizado correctamente');
          this.procesando = false;
        },
        error: (err) => {
          console.error('Error al cambiar estatus:', err);
          toast.error('No se pudo actualizar el estatus');
          this.procesando = false;
        }
      });
    });
  }

  // Igual, solo consume el resultado del formulario de cierre
  private abrirFormularioCierre() {
    solicitarDatosCierreTicket().then((datos) => {
      if (!datos) return;

      const { ventaExitosa, clienteRegistrado } = datos;
      this.procesando = true;

      this.ticketService.cerrarTicket(
        this.ticket.id_ticket,
        ventaExitosa,
        clienteRegistrado,
        this.ticket.id_cliente || null
      ).subscribe({
        next: () => {
          this.ticket.estatus = 4;
          this.ticket.venta_exitosa = ventaExitosa;
          this.ticket.cliente_registrado = clienteRegistrado;
          this.ticket.fecha_cierre = new Date().toISOString();
          toast.success('Ticket cerrado correctamente');
          this.procesando = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error al cerrar ticket:', err);
          toast.error('No se pudo cerrar el ticket');
          this.procesando = false;
        }
      });
    });
  }
  
}