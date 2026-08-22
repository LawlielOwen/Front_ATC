import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';

// Componentes Layout compartidos
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';

// Componentes UI
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { CountComponent } from '../../shared/components/UI/count/count.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { solicitarAvanceProyecto, mostrarExitoProyecto, mostrarErrorProyecto } from '../../shared/utils/proyecto-alerts.util';

// Servicios y Modales
import { AuthService } from '../../core/services/auth.service';
import { ProyectosService } from '../../core/services/Proyectos.service';
import { AltaProyectoPage } from './alta-proyecto/alta-proyecto.page';
import { DetallesProyectoPage } from './detalles-proyecto/detalles-proyecto.page';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SiderbarComponent,
    HeaderComponent,
    ButtonLayoutComponent,
    ButtonNewComponent,
    SearchBarComponent,
    EstatusComponent,
    CountComponent,
    ContainerTableComponent,
    SearchLayoutComponent,
    PaginationComponent,
    TableComponent,
    TableSkeletonComponent
  ]
})
export class ProyectosPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;

  columnasProyectos: TableColumn[] = [];
  proyectos: any[] = [];

  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  cargando: boolean = true;

  estatusActual: number | null = null;
  busqueda: string = '';
  timeoutBusqueda: any;

  totalProyectosMes: number = 0;
  rolUsuario: string = '';
  idUsuarioActivo: number = 0;

  EstatusProyectos = [
    { label: 'Todos', value: null },
    { label: 'En Progreso', value: 1 },
    { label: 'Revisión Cliente', value: 2 },
    { label: 'Ejecución', value: 3 },
    { label: 'En Pausa', value: 5 },
    { label: 'Completado', value: 6 },
    { label: 'Cancelado', value: 0 }
  ];

  constructor(
    public authService: AuthService,
    public dialog: MatDialog,
    public proyectosService: ProyectosService
  ) { }

  ngOnInit() {
    this.decodificarUsuario();
  }

  ionViewWillEnter() {
    this.configurarColumnas();
    this.obtenerTotalMes();
    this.cargarProyectos();
  }

  decodificarUsuario() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.rolUsuario = payload.Rol ? payload.Rol.trim() : '';
        this.idUsuarioActivo = payload.id;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }

  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }

  configurarColumnas() {
    const columnasBase: any[] = [
      { header: 'Proyecto', key: 'nombre_proyecto', subKey: 'empresa_destino', type: 'text' },
      { header: 'Fecha Alta', key: 'fecha_formateada', type: 'text-light', align: 'center' },
      { header: 'Estatus', key: 'estatusTexto', type: 'status', align: 'center' }
    ];

    if (this.authService.tieneAcceso(['Administrador'])) {
      columnasBase.splice(1, 0, { header: 'Técnico', key: 'nombre_tecnico', type: 'text-light' });
    }

    const opcionesMenuAutorizadas = [];
    if (this.authService.tieneAcceso(['Administrador', 'Soporte Tecnico'])) {
      opcionesMenuAutorizadas.push({
        accion: 'avance',
        etiqueta: 'Registrar Avance',
        mostrarSi: (row: any) => row.estatus !== 0 && row.estatus !== 6
      });
      opcionesMenuAutorizadas.push({
        accion: 'editar',
        etiqueta: 'Editar Proyecto'
      });
    }

    if (opcionesMenuAutorizadas.length > 0) {
      columnasBase.push({
        header: '',
        key: 'acciones',
        type: 'actions',
        align: 'center',
        omitirBase: true,
        menuOptions: opcionesMenuAutorizadas
      });
    }

    this.columnasProyectos = columnasBase;
  }

  obtenerTotalMes() {
    let idFiltro = this.rolUsuario.toLowerCase() === 'administrador' ? undefined : this.idUsuarioActivo;

    this.proyectosService.obtenerMetricaMes(idFiltro, this.rolUsuario).subscribe({
      next: (response: any) => {
        this.totalProyectosMes = response.total_mes || 0;
      },
      error: (err) => console.error('Error al cargar métrica mensual', err)
    });
  }

  cargarProyectos() {
    this.cargando = true;

    let idFiltro = this.rolUsuario.toLowerCase() === 'administrador' ? undefined : this.idUsuarioActivo;

    this.proyectosService.buscarProyectos(
      this.currentPage,
      this.limit,
      this.busqueda,
      this.estatusActual,
      idFiltro,
      this.rolUsuario
    ).subscribe({
      next: (response: any) => {
        this.proyectos = response.proyectos.map((proyecto: any) => ({
          ...proyecto,
          estatusTexto: this.obtenerTextoEstatus(proyecto.estatus),
          fecha_formateada: this.formatearFecha(proyecto.fecha_alta)
        }));

        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.limit);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la lista de proyectos:', err);
        this.cargando = false;
      }
    });
  }

  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarProyectos();
  }

  busquedaTexto(texto: string) {
    this.busqueda = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {
      this.cargarProyectos();
    }, 500);
  }

  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarProyectos();
  }

  obtenerTextoEstatus(estatus: number): string {
    const encontrado = this.EstatusProyectos.find(e => e.value === estatus);
    return encontrado ? encontrado.label : 'Desconocido';
  }

  formatearFecha(fechaStr: string) {
    if (!fechaStr) return 'Sin confirmar';
    return new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  altaProyecto() {
    const dialogRef = this.dialog.open(AltaProyectoPage, {
      width: '850px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarProyectos();
        this.obtenerTotalMes();
      }
    });
  }

  verDetalle(proyecto: any) {
    const dialogRef = this.dialog.open(DetallesProyectoPage, {
      width: '900px',
      maxWidth: '105vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      disableClose: true,
      data: { proyecto }
    });

    dialogRef.afterClosed().subscribe((huboRecarga: boolean) => {
      if (huboRecarga) {
        this.cargarProyectos();
        this.obtenerTotalMes();
      }
    });
  }
  abrirModalEdicion(proyectoAEditar: any) {
    const dialogRef = this.dialog.open(AltaProyectoPage, {
      width: '850px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: { proyecto: proyectoAEditar }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarProyectos();
        this.obtenerTotalMes();
      }
    });
  }
async abrirAvanceProyecto(proyecto: any) {
  const datosAvance = await solicitarAvanceProyecto(proyecto.estatus, proyecto.se_cotizo);
  if (!datosAvance) return;

  const idProyecto = proyecto.id_proyecto || proyecto.id;

  this.proyectosService.registrarAvance(
    idProyecto,
    datosAvance.comentario,
    datosAvance.estatus,
    datosAvance.se_cotizo,
    'cambio_estatus'
  ).subscribe({
    next: (res: any) => {
      mostrarExitoProyecto(res.mensaje || 'Avance registrado en la bitácora.');

      proyecto.estatus = datosAvance.estatus;
      proyecto.se_cotizo = datosAvance.se_cotizo;

      this.cargarProyectos();
    },
    error: (err) => mostrarErrorProyecto('No se pudo registrar el avance.')
  });
}
  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'editar':
        this.abrirModalEdicion(evento.row);
        break;
      case 'avance':
        this.abrirAvanceProyecto(evento.row);
        break;
    }
  }
}