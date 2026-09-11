import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { ClientesService } from '../../../core/services/clientes.service';

@Component({
  selector: 'app-modal-vincular-cliente',
  templateUrl: './modal-vincular-cliente.page.html',
  styleUrls: ['./modal-vincular-cliente.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatAutocompleteModule, NgxSonnerToaster,
    HeaderModalComponent, FooterModalComponent, ButtonActionComponent, CardFormComponent
  ]
})
export class ModalVincularClientePage implements OnInit {
  clienteControl = new FormControl<any>('');

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clienteSeleccionado: any = null;

  nombreProspecto: string = '';
  cargandoClientes: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ModalVincularClientePage>,
    private cs: ClientesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.nombreProspecto = data?.nombreProspecto || '';
  }

  ngOnInit() {
    this.cargarClientes();

    this.clienteControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        this.clienteSeleccionado = value;
      } else {
        this.clienteSeleccionado = null;
        this.clientesFiltrados = this._filtrarClientes(value);
      }
    });
  }

  cargarClientes() {
    this.cargandoClientes = true;
    this.cs.getClientes(1, 1000).subscribe({
      next: (response: any) => {
        const datos = response.clientes || response.data || response || [];
        if (Array.isArray(datos)) {
          this.clientes = datos.filter((c: any) => c.estatus === 1 || c.Estatus === 1);
          this.clientesFiltrados = this.clientes;
        }
        this.cargandoClientes = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.cargandoClientes = false;
      }
    });
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
    return cliente.nombre || cliente.Nombre || '';
  }

  confirmar() {
    if (!this.clienteSeleccionado) {
      toast.error('Selecciona un cliente para vincular');
      return;
    }
    this.dialogRef.close(this.clienteSeleccionado.id);
  }

  cerrar() {
    this.dialogRef.close(null);
  }
}