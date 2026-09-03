import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

import { HeaderModalComponent } from "../../shared/components/UI/modal/header-modal/header-modal.component";
import { FooterModalComponent } from "../../shared/components/UI/modal/footer-modal/footer-modal.component";
import { ButtonActionComponent } from "../../shared/components/UI/buttons/button-action/button-action.component";
import { CardFormComponent } from "../../shared/components/UI/form/card-form/card-form.component";
import { InputComponent } from "../../shared/components/UI/form/input/input.component";
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import { AceptarComponent } from '../../shared/components/UI/modal/aceptar/aceptar.component';

import { MarcaService } from '../../core/services/Marcas.service';
import { MarcaConConteo } from '../../shared/model/marcas.model';

@Component({
  selector: 'app-marcas-modal',
  templateUrl: './marcas-modal.page.html',
  styleUrls: ['./marcas-modal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgxSonnerToaster,
    HeaderModalComponent,
    FooterModalComponent,
    ButtonActionComponent,
    CardFormComponent,
    InputComponent,
    SearchBarComponent,
    EstatusComponent,
    ContainerTableComponent,
    SearchLayoutComponent,
    TableComponent,
    TableSkeletonComponent,
    PaginationComponent
  ]
})
export class MarcasModalPage implements OnInit {

  columnasMarcas: TableColumn[] = [
    { header: 'Marca', key: 'Nombre', type: 'text', align: 'left' },
    { header: 'Productos', key: 'total_productos', type: 'count', align: 'center' },
    { header: 'Demos', key: 'total_demos', type:'count', align: 'center' },
    { header: 'Estatus', key: 'EstatusTexto', type: 'status', align: 'center' },
    {
      header: '',
      key: 'acciones',
      type: 'actions',
      align: 'center',
      omitirBase: true,
      menuOptions: [
        { accion: 'editar', etiqueta: 'Editar' },
        {
          accion: 'eliminar',
          etiqueta: 'Desactivar',
          mostrarSi: (row: any) => row.Estatus === 1
        },
        {
          accion: 'activar',
          etiqueta: 'Reactivar',
          mostrarSi: (row: any) => row.Estatus === 0
        }
      ]
    }
  ];

  EstatusMarcas = [
    { label: 'Todas', value: null },
    { label: 'Activas', value: 1 },
    { label: 'Inactivas', value: 0 }
  ];

  marcas: MarcaConConteo[] = [];
  cargando = true;

  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;

  terminoActual: string = '';
  estatusActual: number | null = 1;
  timeoutBusqueda: any;

  // Formulario compacto de alta / edición
  nombreMarca: string = '';
  idEnEdicion: number | null = null;
  guardando = false;

  constructor(
    private marcaService: MarcaService,
    private dialogRef: MatDialogRef<MarcasModalPage>,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargarMarcas();
  }

  cerrar() {
    this.dialogRef.close();
  }

  cargarMarcas() {
    this.cargando = true;
    const estatusParaService = this.estatusActual !== null ? this.estatusActual : -1;

    this.marcaService.getMarcasConConteos(this.terminoActual, estatusParaService, this.currentPage, this.limit)
      .subscribe({
        next: (response: any) => {
          this.marcas = response.marcas.map((m: any) => ({
            ...m,
              EstatusTexto: m.Estatus === 1 ? 'Activo' : 'Inactivo'
          }));
          this.totalRecords = response.total;
          this.totalPages = Math.max(1, Math.ceil(response.total / this.limit));
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar marcas', err);
          toast.error('No se pudieron cargar las marcas');
          this.cargando = false;
        }
      });
  }

  busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) clearTimeout(this.timeoutBusqueda);
    this.timeoutBusqueda = setTimeout(() => this.cargarMarcas(), 500);
  }

  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarMarcas();
  }

  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarMarcas();
  }

  // ── Alta / edición (mismo input hace ambas cosas) ──
  guardarMarca() {
    const nombre = this.nombreMarca.trim();
    if (!nombre) {
      toast.error('Escribe el nombre de la marca');
      return;
    }

    this.guardando = true;

    const accion = this.idEnEdicion
      ? this.marcaService.modificarMarca(this.idEnEdicion, nombre)
      : this.marcaService.agregarMarca(nombre);

    accion.subscribe({
      next: (res: any) => {
        toast.success(res.mensaje || 'Marca guardada correctamente');
        this.cancelarEdicion();
        this.guardando = false;
        this.cargarMarcas();
      },
      error: (err) => {
        console.error(err);
        toast.error('Ocurrió un error al guardar la marca');
        this.guardando = false;
      }
    });
  }

  cancelarEdicion() {
    this.idEnEdicion = null;
    this.nombreMarca = '';
  }

  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'editar':
        this.idEnEdicion = evento.row.id;
        this.nombreMarca = evento.row.Nombre;
        break;
      case 'eliminar':
        this.confirmarCambioEstatus(evento.row, false);
        break;
      case 'activar':
        this.confirmarCambioEstatus(evento.row, true);
        break;
    }
  }

confirmarCambioEstatus(marca: MarcaConConteo, activar: boolean) {
    const dialogRef = this.dialog.open(AceptarComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: activar ? 'Reactivar Marca' : 'Desactivar Marca',
        mensaje: activar
          ? `¿Deseas reactivar la marca "${marca.Nombre}"?`
          : `¿Deseas desactivar la marca "${marca.Nombre}"? Los productos y demos existentes no se ven afectados.`,
        textoAceptar: activar ? 'Reactivar' : 'Desactivar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;

      const accion = activar
        ? this.marcaService.activarMarca(marca.id)
        : this.marcaService.eliminarMarca(marca.id);

      accion.subscribe({
        next: (res: any) => {
          toast.success(res.mensaje);
          this.cargarMarcas();
        },
        error: (err) => {
          console.error(err);
          toast.error('No se pudo actualizar el estatus de la marca');
        }
      });
    });
}
  iniciarEdicion(marca: MarcaConConteo, event?: Event) {
  this.idEnEdicion = marca.id;
  this.nombreMarca = marca.Nombre;

  const contenedor = (event?.target as HTMLElement)?.closest('.overflow-y-auto');
  contenedor?.scrollTo({ top: 0, behavior: 'smooth' });
}
}