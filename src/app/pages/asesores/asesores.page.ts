import { Component, OnInit, ViewChild } from '@angular/core';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CountComponent } from '../../shared/components/UI/count/count.component';
import { AsesoresService } from "../../core/services/Asesores.service";
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { ModalAsesorPage } from './modal-asesor/modal-asesor.page';
import { DetallesPage } from './detalles/detalles.page';
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-asesores',
  templateUrl: './asesores.page.html',
  styleUrls: ['./asesores.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, ButtonLayoutComponent,
    ButtonNewComponent, SearchBarComponent, EstatusComponent, CountComponent, ContainerTableComponent,
    SearchLayoutComponent, PaginationComponent, TableComponent, TableSkeletonComponent,
    CommonModule
  ]
})
export class AsesoresPage implements OnInit {
  columnasAsesores: TableColumn[] = [
    {
      header: 'Asesor',
      key: 'Nombre_completo',
      subKey: 'usuario',    // Muestra el nombre de usuario (ej. mramos) debajo del nombre completo
      type: 'avatar-text',
      align: 'left'
    },
    {
      header: 'Contacto',
      key: 'Correo',
      subKey: 'telefono',   // Muestra el teléfono en pequeño debajo del correo
      type: 'text',
      align: 'left'
    },
    {
      header: 'Rol',
      key: 'Rol',
      type: 'text',         // Si en el futuro creas un 'pill-rol', aquí lo cambiarías
      align: 'center'
    },
    {
      header: 'Contratación',
      key: 'fecha_formato',
      type: 'text-light',   // Ideal para fechas para que no compitan visualmente con los nombres
      align: 'center'
    },
    {
      header: 'Estatus',
      key: 'EstatusTexto',       // Asegúrate de mapear esto a tu texto/clase de Activo/Inactivo en tu HTML
      type: 'status',
      align: 'center'
    },
    {
      header: '',
      key: 'acciones',
      type: 'actions',
      align: 'center',
      omitirBase: true,
      menuOptions: [
        {
          accion: 'editar',
          etiqueta: 'Modificar'
        },
        {
          accion: 'eliminar',
          etiqueta: 'Dar de baja',
          mostrarSi: (row: any) => row.Estatus !== 0
        }
      ]
    }
  ];
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  terminoActual: string = '';
  estatusActual: number | null = 1;
  cargando: boolean = true;
  totalAsesores: number = 0;
    timeoutBusqueda: any;

  EstatusAsesores = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: 1 },
    { label: 'Inactivos', value: 0 }
  ];
  asesores: any[] = [];

  constructor(private asesoresService: AsesoresService, public dialog: MatDialog) { }

  ngOnInit() {
    this.cargarAsesores();
    this.cargarTotalActivos();
  }
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  cargarAsesores() {
    this.cargando = true;

    const estatusParaService = this.estatusActual !== null ? this.estatusActual : -1;

    this.asesoresService.buscarAsesores(this.terminoActual, estatusParaService, this.currentPage, this.limit)
      .subscribe({
        next: (response) => {
          this.asesores = response.a.map(asesor => ({
            ...asesor,
            fecha_formato: this.formatearFecha(asesor.Fecha_contratacion),
            EstatusTexto: this.obtenerTextoEstatus(asesor.Estatus)
          }));
          this.totalRecords = response.total;
          this.totalPages = response.paginas;
          this.currentPage = response.paginaActual;

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar la lista de asesores', err);
          this.cargando = false;
        }
      });
  }

  // Método adicional para el componente <app-count>
  cargarTotalActivos() {
    this.asesoresService.cantidadAsesoresActivos().subscribe({
      next: (response) => {
        this.totalAsesores = response.total;
      },
      error: (err) => {
        console.error('Error al cargar el total de activos', err);
      }
    });
  }
  obtenerTextoEstatus(Estatus: number): string {
    if (Estatus === 1) return 'Activo';
    return 'Inactivo';
  }
 busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {
      
      this.cargarAsesores();
      
    }, 500);
  }


  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarAsesores();
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarAsesores();
  }

  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'editar':
        this.abrirModalEdicion(evento.row);
        break;
      case 'eliminar':
       this.desactivarAsesor(evento.row);
        break;
    }
  }
  detallesAsesor(asesorSeleccionado: any) {
 const dialogRef = this.dialog.open(DetallesPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { asesor: asesorSeleccionado }
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarAsesores();
        this.cargarTotalActivos();
      }
    });
  }
  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'Sin fecha';
    let f = new Date(fecha);
    if (typeof fecha === 'string' && fecha.length === 10 && fecha.includes('-')) {
      f = new Date(`${fecha}T12:00:00`);
    }

    if (isNaN(f.getTime())) return 'Fecha inválida';

    const dia = f.getDate().toString().padStart(2, '0');

    let mes = f.toLocaleString('es-MX', { month: 'long' }).replace('.', '');
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);

    const anio = f.getFullYear();

    return `${dia} ${mes} ${anio}`;
  }
  nuevoAsesor() {
    const dialogRef = this.dialog.open(ModalAsesorPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarAsesores();
        this.cargarTotalActivos();
      }
    });
  }
  abrirModalEdicion(asesorAEditar: any) {
    const dialogRef = this.dialog.open(ModalAsesorPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: asesorAEditar 
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarAsesores();
        this.cargarTotalActivos();
      }
    });
  }
  desactivarAsesor(asesor: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Desactivar Asesor',
        mensaje: `¿Estás seguro de que deseas desactivar al usuario?`,
        textoAceptar: 'Desactivar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.asesoresService.deleteAsesor(asesor.id).subscribe({
          next: (response: any) => {
            toast.success('Asesor desactivado correctamente');
  
             this.cargarAsesores();
        this.cargarTotalActivos();
          },
          error: (err) => {
            console.error('Error al desactivar', err);
            toast.error('No se pudo desactivar');
          }
        });
      }
    });
  }
}
