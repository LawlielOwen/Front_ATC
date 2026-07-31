import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";

import { TicketService } from "../../../core/services/Tickets.service";
import { ClientesService } from "../../../core/services/clientes.service";
import { AsesoresService } from "../../../core/services/Asesores.service";
import { Asesor } from "../../../shared/model/asesor.model";

@Component({
  selector: 'app-modal-ticket',
  templateUrl: './modal-ticket.page.html',
  styleUrls: ['./modal-ticket.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    NgxSonnerToaster, HeaderModalComponent, FooterModalComponent,
    ButtonActionComponent, InputComponent, SelectComponent, CardFormComponent
  ]
})
export class ModalTicketPage implements OnInit {

  isEditMode: boolean = false;
  ticketIdEdit: number | null = null;

  asesores: Asesor[] = [];
  clientes: any[] = [];
  clientesFiltrados: any[] = [];

  clienteControl = new FormControl<any>('');

  ticketData: any = {
    id_asesor: '',
    id_cliente: null,
    nombre_prospecto: '',
    url_ticket: '',
    comentarios: ''
  };

  constructor(
    private ticketService: TicketService,
    private clientesService: ClientesService,
    private asesoresService: AsesoresService,
    @Optional() public dialogRef: MatDialogRef<ModalTicketPage>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.cargarAsesores();
    this.cargarClientes();

    this.clienteControl.valueChanges.subscribe((valorBuscado) => {
      this.clientesFiltrados = this._filtrarClientes(valorBuscado);

      if (typeof valorBuscado === 'object' && valorBuscado !== null) {
        this.ticketData.id_cliente = valorBuscado.id || valorBuscado.Id || valorBuscado.ID;
        this.ticketData.nombre_prospecto = ''; // Cliente registrado, no hace falta el texto libre
      } else if (typeof valorBuscado === 'string') {
        this.ticketData.id_cliente = null;
        this.ticketData.nombre_prospecto = valorBuscado; // Prospecto sin registrar
      }
    });
  }

  cargarAsesores() {
    this.asesoresService.getAsesores().subscribe({
      next: (response: any) => {
        this.asesores = response.filter((asesor: Asesor) => ['Asesor', 'Administrador'].includes(asesor.Rol));
      },
      error: (err) => console.error('Error al cargar asesores', err)
    });
  }

  cargarClientes() {
    this.clientesService.getClientes(1, 1000).subscribe({
      next: (response: any) => {
        const datosCrudos = response.clientes || response.data || response || [];
        if (Array.isArray(datosCrudos)) {
          this.clientes = datosCrudos.filter((c: any) => c.estatus === 1 || c.Estatus === 1);
          this.clientesFiltrados = this.clientes;
        }

        // Hasta tener la lista de clientes cargada podemos precargar el ticket a editar
        if (this.data && this.data.ticket) {
          this.precargarTicket(this.data.ticket);
        }
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        toast.error('Error al cargar la lista de clientes');
      }
    });
  }

  private precargarTicket(ticket: any) {
    this.isEditMode = true;
    this.ticketIdEdit = ticket.id_ticket || ticket.id;

    this.ticketData.id_asesor = ticket.id_asesor;
    this.ticketData.url_ticket = ticket.url_ticket || '';
    this.ticketData.comentarios = ticket.comentarios || '';

    const esClienteRegistrado = ticket.id_cliente && ticket.id_cliente !== 0 && ticket.id_cliente !== 'null';

    if (esClienteRegistrado) {
      const clienteEncontrado = this.clientes.find((c: any) => c.id == ticket.id_cliente)
        || { id: ticket.id_cliente, Nombre: ticket.nombre_cliente || ticket.nombre_prospecto };
      this.clienteControl.setValue(clienteEncontrado);
    } else if (ticket.nombre_prospecto) {
      this.clienteControl.setValue(ticket.nombre_prospecto);
    }
  }

  private _filtrarClientes(valorBuscado: any): any[] {
    const filtro = (typeof valorBuscado === 'string' ? valorBuscado : '').toLowerCase();

    return this.clientes.filter(cliente => {
      const nombreCliente = cliente.nombre || cliente.Nombre || '';
      return nombreCliente.toLowerCase().includes(filtro);
    });
  }

  mostrarNombreCliente(cliente: any): string {
    if (!cliente) return '';
    if (typeof cliente === 'string') return cliente;
    return cliente.nombre || cliente.Nombre || cliente.nombre_cliente_final || '';
  }

  procesarAccion() {
    if (!this.ticketData.id_asesor) {
      toast.error('Debes asignar un asesor al ticket');
      return;
    }

    if (!this.ticketData.url_ticket || this.ticketData.url_ticket.trim().length === 0) {
      toast.error('Debes ingresar la URL del ticket');
      return;
    }

    if (!this.ticketData.id_cliente && !this.ticketData.nombre_prospecto) {
      toast.error('Debes seleccionar un cliente o escribir su nombre');
      return;
    }

    const payload = {
      id_asesor: this.ticketData.id_asesor,
      id_cliente: this.ticketData.id_cliente || null,
      nombre_prospecto: this.ticketData.nombre_prospecto || null,
      url_ticket: this.ticketData.url_ticket.trim(),
      comentarios: this.ticketData.comentarios?.trim() || null
    };

    if (this.isEditMode && this.ticketIdEdit) {
      this.ticketService.modificarTicket(this.ticketIdEdit, payload).subscribe({
        next: () => {
          toast.success('Ticket actualizado correctamente');
          this.dialogRef?.close(true);
        },
        error: (err) => {
          console.error('Error al actualizar ticket', err);
          toast.error('No se pudo actualizar el ticket');
        }
      });
    } else {
      this.ticketService.crearTicket(payload).subscribe({
        next: (res: any) => {
          toast.success(res?.mensaje || 'Ticket creado correctamente');
          this.dialogRef?.close(true);
        },
        error: (err) => {
          console.error('Error al crear ticket', err);
          toast.error('No se pudo crear el ticket');
        }
      });
    }
  }

  cerrar() {
    this.dialogRef?.close(false);
  }
}