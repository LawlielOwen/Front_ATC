import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
import { FooterModalComponent } from "../../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { HeaderModalComponent } from "../../../shared/components/UI/modal/header-modal/header-modal.component";
import { ButtonActionComponent } from "../../../shared/components/UI/buttons/button-action/button-action.component";
import { DateComponent } from "../../../shared/components/UI/form/date/date.component";
import { SelectComponent } from "../../../shared/components/UI/form/select/select.component";
import { InputComponent } from "../../../shared/components/UI/form/input/input.component";
import { CardFormComponent } from "../../../shared/components/UI/form/card-form/card-form.component";
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { VisitaService } from '../../../core/services/Visitas.service';
import { DemoService } from '../../../core/services/Demos.service';
import { ClientesService } from '../../../core/services/clientes.service';
import { AuthService } from '../../../core/services/auth.service';

import { Asesor } from "../../../shared/model/asesor.model";
import { AsesoresService } from "../../../core/services/Asesores.service";

@Component({
  selector: 'app-modal-visita',
  templateUrl: './modal-visita.page.html',
  styleUrls: ['./modal-visita.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonicModule, NgxSonnerToaster, FooterModalComponent, HeaderModalComponent,
    ButtonActionComponent, DateComponent, CardFormComponent, FormsModule, SelectComponent,
    InputComponent, ReactiveFormsModule, MatAutocompleteModule  
  ]
})
export class ModalVisitaPage implements OnInit {
  // Lógica de Demos
  demosSolicitados: any[] = [];
  demoControl = new FormControl('');
  demosFiltrados: any[] = [];

  clienteControl = new FormControl('');
  clientes: any[] = [];
  clientesFiltrados: any[] = [];

  asesores: Asesor[] = [];
  nombreTecnicoActivo: string = '';

  visitaNueva = {
    id_tecnico: null as any,
    id_asesor: null as any,
    id_cliente: null as any,
    empresa_no_registrada: '',
    fecha_visita: ''
  };

  constructor(
    private dialogRef: MatDialogRef<ModalVisitaPage>,
    private vs: VisitaService,
    private ds: DemoService,
    private cs: ClientesService,
    private asesorService: AsesoresService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.cargarClientes();
    this.cargarAsesores(); 

   const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.visitaNueva.id_tecnico = payload.id;
        this.nombreTecnicoActivo = payload.Nombre_completo || payload.Nombre || payload.nombre || 'Técnico';
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }

    this.clienteControl.valueChanges.subscribe((valorBuscado: any) => {
      this.clientesFiltrados = this._filtrarClientes(valorBuscado);

      if (typeof valorBuscado === 'object' && valorBuscado !== null) {
        this.visitaNueva.id_cliente = valorBuscado.id || valorBuscado.Id || valorBuscado.ID;
        this.visitaNueva.empresa_no_registrada = ''; 
      }
      else if (typeof valorBuscado === 'string') {
        this.visitaNueva.id_cliente = null; 
        this.visitaNueva.empresa_no_registrada = valorBuscado; 
      }
    });

 
    this.demoControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termino => {
        if (!termino || typeof termino !== 'string' || termino.trim().length < 2) {
          this.demosFiltrados = [];
          return of(null);
        }
        return this.ds.buscarDemosParaVisita(termino.trim());
      })
    ).subscribe({
      next: (res: any) => {
        if (res) {
          this.demosFiltrados = res || [];
        }
      },
      error: (err) => {
        console.error('Error al buscar demos', err);
        this.demosFiltrados = [];
      }
    });
  }

  cargarClientes() {
    this.cs.getClientes(1, 1000).subscribe({
      next: (response: any) => {
        const datosCrudos = response.clientes || response.data || response || [];
        if (Array.isArray(datosCrudos)) {
          this.clientes = datosCrudos.filter((c: any) => c.estatus === 1 || c.Estatus === 1);
          this.clientesFiltrados = this.clientes;
        }
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        toast.error('Error al cargar la lista de clientes');
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
    return cliente.nombre || cliente.Nombre || cliente.nombre_cliente_final || '';
  }

  cargarAsesores() {
    this.asesorService.getAsesores().subscribe({
      next: (response: any) => {
        this.asesores = response.filter((asesor: Asesor) => ['Asesor', 'Administrador'].includes(asesor.Rol) && asesor.Estatus === 1);
      },
      error: (err) => console.error('Error al cargar asesores', err)
    });
  }

  onEnterDemo(event: any) {
    const termino = event.target.value?.trim();
    if (!termino) return;

    if (this.demosFiltrados.length === 1) {
      this.seleccionarDemo(this.demosFiltrados[0]);
    } else if (this.demosFiltrados.length > 1) {
      toast.info('Selecciona un equipo de la lista desplegada.');
    }
  }

  seleccionarDemo(demo: any) {
    const yaExiste = this.demosSolicitados.some(d => d.id_demo === demo.id_demo);

    if (yaExiste) {
      toast.error(`El equipo "${demo.nombre_modelo}" ya está en la lista. Si necesitas más piezas, aumenta la cantidad en la tabla.`);
      this.demoControl.setValue('', { emitEvent: false });
      this.demosFiltrados = [];
      return;
    }

    if (demo.stock <= 0) {
      toast.error(`El equipo "${demo.nombre_modelo}" no cuenta con stock disponible en este momento.`);
      return;
    }

    this.demosSolicitados.push({
      id_demo: demo.id_demo,
      nombre_modelo: demo.nombre_modelo,
      numero_serie: demo.numero_serie,
      stock_actual: demo.stock,
      cantidad: 1
    });

    this.demoControl.setValue('', { emitEvent: false });
    this.demosFiltrados = [];
  }

  eliminarFila(index: number) {
    this.demosSolicitados.splice(index, 1);
  }

  cerrar() {
    this.dialogRef.close(false);
  }

  guardarVisita() {
    if (!this.visitaNueva.fecha_visita || !this.visitaNueva.id_asesor || !this.visitaNueva.id_tecnico) {
      toast.error('Por favor, completa la fecha y selecciona al asesor de ventas.');
      return;
    }

    if (!this.visitaNueva.id_cliente && !this.visitaNueva.empresa_no_registrada) {
      toast.error('Debes seleccionar un cliente registrado o escribir el nombre de la empresa a visitar.');
      return;
    }

    if (this.demosSolicitados.length === 0) {
      toast.error('Debes agregar al menos un equipo demo para programar la visita.');
      return;
    }

    const excedidos = this.demosSolicitados.some(d => d.cantidad > d.stock_actual || d.cantidad <= 0);
    if (excedidos) {
      toast.error('Verifica las cantidades. No puedes solicitar más piezas de las que hay en stock ni poner 0.');
      return;
    }

    const fechaObj = new Date(this.visitaNueva.fecha_visita);
    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const fechaMySQL = `${anio}-${mes}-${dia}`;

    const payload = {
      fecha_visita: fechaMySQL,
      id_tecnico: this.visitaNueva.id_tecnico,
      id_asesor: this.visitaNueva.id_asesor,
      id_cliente: this.visitaNueva.id_cliente,
      empresa_no_registrada: this.visitaNueva.empresa_no_registrada || null,
      demos: this.demosSolicitados.map(d => ({
        id_demo: d.id_demo,
        cantidad: d.cantidad
      }))
    };

    this.vs.crearVisita(payload).subscribe({
      next: (response) => {
        toast.success('Visita programada exitosamente');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        toast.error('Ocurrió un error al programar la visita');
      }
    });
  }
}