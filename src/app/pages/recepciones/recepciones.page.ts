import { Component, OnInit, ViewChild } from '@angular/core';
import { ProveedorService } from '../../core/services/Proveedores.service';
import { CommonModule } from '@angular/common';
import { ModalRepecionPage } from './modal-repecion/modal-repecion.page'
import { DetallesRecepcionPage } from './detalles-recepcion/detalles-recepcion.page'


import { FiltroDinamicoComponent, FilterOption } from '../../shared/components/UI/Filter/filtro-dinamico/filtro-dinamico.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component'
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { StatCardComponent } from '../../shared/components/UI/stat-card/stat-card.component'
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { FiltroFechaComponent } from '../../shared/components/UI/Filter/filtro-fecha/filtro-fecha.component';
import { MarcaService } from '../../core/services/Marcas.service';
import { Marcas } from '../../shared/model/marcas.model';
import { MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import { notificacionService } from '../../core/services/Notificaciones.service';

@Component({
  selector: 'app-recepciones',
  templateUrl: './recepciones.page.html',
  styleUrls: ['./recepciones.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, ButtonLayoutComponent,
    ButtonNewComponent, SearchBarComponent, CountComponent, ContainerTableComponent,
    SearchLayoutComponent, PaginationComponent, StatCardComponent
    , FiltroFechaComponent, CommonModule, EstatusComponent,
    TableComponent, TableSkeletonComponent, FiltroDinamicoComponent
  ]
})
export class RecepcionesPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  terminoActual: string = '';
  estatusActual: number | null = null;
  fechaIni: string = '';
  fechaFin: string = '';
  cargando: boolean = true;
  Totalpendientes: number = 0;
  Totalrecibidos: number = 0;
  Totalincidentes: number = 0;
  Totalanual: number = 0;
  idUsuario: number = 0;
  rolUsuario: string = '';
  pedidosLista: any[] = [];
  proveedorActual: number | null = null;
  marcaActual: number | null = null;
  timeoutBusqueda: any;
  constructor(private ps: ProveedorService, public dialog: MatDialog, private marcaService: MarcaService) { }
  columnasPedidos: TableColumn[] = [
    {
      header: 'Proveedor',
      key: 'nombre_proveedor',
      type: 'avatar-text'
    },
    {
      header: 'Solicitado por',
      key: 'nombre_asesor',
      type: 'text-light'
    },
    {
      header: 'Carga Esperada',
      key: 'resumen_modelos',
      subKey: 'resumen_piezas',
      type: 'text-light'
    },
    {
      header: 'Fechas',
      key: 'fecha_estimada_formateada',
      subKey: 'fecha_solicitud_formateada',
      type: 'text-light'
    },
    {
      header: 'Estatus',
      key: 'estatusTexto',
      type: 'status',
      align: 'center'
    }
  ];
  EstatusPedidos = [
    { label: 'Todos', value: null },
    { label: 'Recibidos', value: 1 },
    { label: 'Pendientes', value: 0 },
    { label: 'Con incidencia', value: 2 }
  ];
  opcionesMarcas: FilterOption[] = [];


  ngOnInit() {
  }
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }

  cargarEstadisticas() {
    this.ps.obtenerEstadisticasPedidos().subscribe({
      next: (data) => {
        const estadisticas = data[0];
        this.Totalpendientes = parseInt(estadisticas.pendientes) || 0;
        this.Totalrecibidos = parseInt(estadisticas.recibidos) || 0;
        this.Totalincidentes = parseInt(estadisticas.con_incidencia) || 0;
        this.Totalanual = parseInt(estadisticas.total_anual) || 0;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }
  cargarMarcas() {
    this.marcaService.getMarcasActivas().subscribe({
      next: (marcas: Marcas[]) => {
        this.opcionesMarcas = [
          { label: 'Todas las marcas', value: null },
          ...marcas.map(m => ({ label: m.Nombre, value: m.id }))
        ];
      },
      error: (err) => console.error('Error al cargar marcas', err)
    });
  }
  formatearFecha(fechaStr: string) {
    if (!fechaStr) return 'Sin confirmar';
    return new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  obtenerTextoEstatus(estatus: number): string {
    const mapaEstatus: Record<number, string> = {
      0: 'Pendiente',
      1: 'Recibido',
      2: 'Con incidencia'
    };
    return mapaEstatus[estatus] || 'Desconocido';
  }
  cargarPedidos() {
    this.cargando = true;
    this.ps.buscarPedido(
      this.terminoActual,
      this.proveedorActual,
      this.estatusActual,
      this.fechaIni,
      this.fechaFin,
      this.currentPage,
      this.limit
    ).subscribe({
      next: (res: any) => {
        const listaCruda = res.pedidos || [];

        this.pedidosLista = listaCruda.map((pedido: any) => ({
          ...pedido,
          estatusTexto: this.obtenerTextoEstatus(pedido.Estatus),
          resumen_modelos: `${pedido.total_modelos_diferentes} Modelos`,
          resumen_piezas: `${pedido.total_piezas} piezas en total`,

          fecha_estimada_formateada: `Estimada: ${this.formatearFecha(pedido.fecha_estimada)}`,
          fecha_solicitud_formateada: `Solicitada: ${this.formatearFecha(pedido.fecha_solicitud)}`
        }));

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la tabla', err);
        this.cargando = false;
      }
    });
  }
  nuevoPedido() {
    const dialogRef = this.dialog.open(ModalRepecionPage, {
      width: '670px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarPedidos();
        this.cargarEstadisticas();
      }
    });
  }
  busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {

      this.cargarPedidos();

    }, 500);
  }
  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarPedidos();
  }
  filtroProv(provId: number | null) {
    this.proveedorActual = provId;
    this.currentPage = 1;
    this.cargarPedidos();
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarPedidos();
  }
  filtroFecha(rango: { inicio: any, fin: any }) {
    this.fechaIni = rango.inicio;
    this.fechaFin = rango.fin;
    this.currentPage = 1;
    this.cargarPedidos();
  }
  abrirDetalles(pedido: any) {
    const dialogRef = this.dialog.open(DetallesRecepcionPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { pedido }
    });
    dialogRef.afterClosed().subscribe((exito: boolean) => {
      if (exito) {
        this.cargarPedidos();
        this.cargarEstadisticas();
      }
    });
  }
  ionViewWillEnter() {
    this.cargarEstadisticas();
    this.cargarPedidos();
    this.cargarMarcas();
  }
}
