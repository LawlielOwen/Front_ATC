import { Component, OnInit, ViewChild } from '@angular/core';
import { PedidoService } from '../../core/services/Pedidos.service';
import { CommonModule } from '@angular/common';
import { SubirReciboPage } from './subir-recibo/subir-recibo.page'
import { DetallePedidoPage } from './detalle-pedido/detalle-pedido.page'
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import { StatCardComponent } from '../../shared/components/UI/stat-card/stat-card.component'
import { toast } from 'ngx-sonner';
import { FiltroFechaComponent } from '../../shared/components/UI/Filter/filtro-fecha/filtro-fecha.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, NgxSonnerToaster, ButtonLayoutComponent,
   CountComponent, ContainerTableComponent, TableComponent, StatCardComponent, SearchLayoutComponent,
    EstatusComponent, SearchBarComponent, TableSkeletonComponent, PaginationComponent, CommonModule, FiltroFechaComponent,
  ]
})
export class PedidosPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  terminoActual: string = '';
  estatusActual: number | null = 1;
  fechaIni: string = '';
  fechaFin: string = '';
  Totalcanceladas: number = 0;
  Totalpendientes: number = 0;
  Totalpagadas: number = 0;
  Totalmensual: number = 0;
  idUsuario: number = 0;
  rolUsuario: string = '';
  cargando: boolean = true;
columnasPedidos: TableColumn[] = [];
  pedidosLista: any[] = [];
  timeoutBusqueda: any;
  estatusPedidos = [
    { label: 'Todos', value: null },
    { label: 'Pendientes', value: 1 },
    { label: 'Canceladas', value: 0 },
    { label: 'Completadas', value: 2 }
  ];
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  constructor(private ps: PedidoService, public dialog: MatDialog,public authService: AuthService) { }


  ngOnInit() {

  }
  definirColumnasPorRol() {
    // Definimos las columnas que TODO el mundo puede ver
    const columnasBase: TableColumn[] = [
      { header: 'Cliente', key: 'nombre_cliente', type: 'text' },
      { header: 'Fecha de registro', key: 'fecha_pedido', type: 'text-light' },
      { header: 'Fecha limite', key: 'fecha_limite', type: 'text-light' },
      { header: 'Asesor encargado', key: 'nombre_asesor', type: 'text' },
      { header: 'Estatus', key: 'estatusTexto', type: 'status', align: 'center' }
    ];

    // Arreglo temporal para las acciones permitidas
    const opcionesMenuAutorizadas = [];

    // RESTRICCIÓN 1: "Subir recibo" (Asesores y Administradores)
    if (this.authService.tieneAcceso(['Administrador', 'Asesor'])) {
      opcionesMenuAutorizadas.push({
        accion: 'subir_recibo', 
        etiqueta: 'Subir recibo de pago',
        mostrarSi: (row: any) => row.Estatus === 1
      });
    }

    // RESTRICCIÓN 2: "Cancelar" (Administradores y Cotizadores)
    if (this.authService.tieneAcceso(['Administrador', 'Cotizador'])) {
      opcionesMenuAutorizadas.push({
        accion: 'cancelar', 
        etiqueta: 'Cancelar',
        mostrarSi: (row: any) => row.Estatus === 1 
      });
    }

    // Si el rol tiene al menos una acción permitida, inyectamos la columna de los "3 puntitos"
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

    // Finalmente, asignamos todo a la variable principal
    this.columnasPedidos = columnasBase;
  }
  ionViewWillEnter() {
    this.cargarPedidos();
    this.cargarEstadisticas();
    this.definirColumnasPorRol();
  }
  cargarPedidos() {
    this.cargando = true;

    // El backend espera -1 para "Todos". Si estatusActual es null, mandamos -1.
    const estatus = this.estatusActual !== null ? this.estatusActual : -1;

    this.ps.obtenerPedidos(
      this.terminoActual,
      estatus,
      this.fechaIni, // Pasamos la fecha de inicio
      this.fechaFin, // Agregamos la fecha de fin
      this.currentPage,
      this.limit
    ).subscribe({
      next: (res) => {
        this.pedidosLista = res.pedidos.map((pedido: any) => {
          return {
            ...pedido,
            estatusTexto: this.obtenerTextoEstatus(pedido.Estatus),
            fecha_pedido: this.formatearFecha(pedido.fecha_pedido),
            fecha_limite: this.formatearFecha(pedido.fecha_limite)
          };
        });

        this.totalRecords = res.total;
        this.totalPages = res.paginas;
        this.currentPage = res.paginaActual;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        toast.error('Ocurrió un error al obtener la lista de pedidos');
        this.cargando = false;
      }
    });
  }

  cargarEstadisticas() {
    this.ps.obtenerEstadisticas().subscribe({
      next: (res) => {
        this.Totalpendientes = res.pendientes;
        this.Totalcanceladas = res.cancelados;
        this.Totalpagadas = res.pagados;
        this.Totalmensual = res.total_mes;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        toast.error('No se pudieron actualizar los contadores del dashboard');
      }
    });
  }
  obtenerTextoEstatus(estatus: number): string {
    const mapaEstatus: Record<number, string> = {
      0: 'Cancelado',
      1: 'Pendiente',
      2: 'Completado'
    };
    return mapaEstatus[estatus] || 'Desconocido';
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
  filtroFecha(rango: { inicio: any, fin: any }) {
    this.fechaIni = rango.inicio;
    this.fechaFin = rango.fin;
    this.currentPage = 1;
    this.cargarPedidos();

  }
  detallesPed(pedido: any) {
const dialogRef = this.dialog.open(DetallePedidoPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { detalles: pedido }
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarPedidos();
        this.cargarEstadisticas();
      }
    });
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarPedidos();
  }
  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'subir_recibo':
        this.subirPDF(evento.row);
        break;
      case 'cancelar':
        this.cancelarCotizacion(evento.row);
        break;

    }
  }
  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'Sin fecha';
    
    // Si la fecha viene con guiones y sin hora (ej. '2026-06-20'), 
    // le agregamos 'T12:00:00' para evitar que la zona horaria le reste un día.
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
  cancelarCotizacion(ped: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Cancelar Pedido',
        mensaje: `¿Estás seguro de que deseas cancelar este pedido?`,
        textoAceptar: 'Aceptar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.ps.cancelarPedido(ped.id).subscribe({
          next: (response: any) => {
            toast.success('Pedido cancelado');

            this.cargarPedidos();
            this.cargarEstadisticas();
          },
          error: (err) => {
            console.error('Error al cancelar', err);
            toast.error('No se pudo cancelar');
          }
        });
      }
    });
  }
  subirPDF(ped: any) {
   const dialogRef = this.dialog.open(SubirReciboPage, {
      width: '650px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      
      data: { idPedido: ped.id } 
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarPedidos();
        this.cargarEstadisticas();
      }
    });
  }
}
