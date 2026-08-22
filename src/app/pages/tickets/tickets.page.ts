import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/Tickets.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalTicketPage } from './modal-ticket/modal-ticket.page';
import { DetalleTicketPage } from './detalle-ticket/detalle-ticket.page';
@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, ButtonLayoutComponent,
    ButtonNewComponent, SearchBarComponent, EstatusComponent, CountComponent, ContainerTableComponent,
    SearchLayoutComponent, PaginationComponent, TableComponent, TableSkeletonComponent,
    CommonModule
  ]
})
export class TicketsPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  columnasTickets: TableColumn[] = [];
  currentPage: number = 1;
  tickets: any[] = [];
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  estatusActual: number | null = null;
  cargando: boolean = true;
  totalTickets: number = 0;
  rolUsuario: string = '';
  user: any;
  busqueda: string = '';
  timeoutBusqueda: any;
  constructor(public authService: AuthService, public dialog: MatDialog, public ticketService: TicketService) { }
  EstatusTickets = [
    { label: 'Todos', value: null },
    { label: 'Asignados', value: 1 },
    { label: 'Contactados', value: 2 },
    { label: 'Cotizados', value: 3 },
    { label: 'Cerrados', value: 4 },
  ];
  ngOnInit() {
  }
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  configurarColumnas() {
    const columnasBase: any[] = [
      { header: 'Cliente', key: 'cliente_final', type: 'text' },
      { header: 'URL', key: 'url_ticket', type: 'link', align: 'center' },
      { header: 'Fecha Asignación', key: 'fecha_formateada', type: 'date', align: 'center' },
      { header: 'Estatus', key: 'estatusTexto', type: 'status', align: 'center' }
    ];
    if (this.authService.tieneAcceso(['Administrador'])) {
      columnasBase.splice(1, 0, { header: 'Asesor', key: 'nombre_asesor', type: 'text' });
    }


    this.columnasTickets = columnasBase;
  }
  obtenerTotal() {
    this.ticketService.contarTicketsAnual().subscribe({
      next: (response: any) => {
        this.totalTickets = response.total;
      }
    })
  }
cargarTickets() {
    this.cargando = true;

    const textoBusqueda = this.busqueda || '';
    const estatus = this.estatusActual || 0;
    
    let idAsesorFiltro = 0; 
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rol = payload.Rol ? payload.Rol.toLowerCase().trim() : '';

        if (rol === 'asesor') {
          idAsesorFiltro = payload.id;
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }

    this.ticketService.buscarTickets(textoBusqueda, estatus, idAsesorFiltro, this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        this.tickets = response.tickets.map((ticket: any) => ({
          ...ticket,
          estatusTexto: this.obtenerTextoEstatus(ticket.estatus),
          fecha_formateada: this.formatearFecha(ticket.fecha_alta)
        }));

        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.limit);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la lista de tickets:', err);
        this.cargando = false;
      }
    });
  }
  ionViewWillEnter() {
    this.rolUsuario = this.user?.rol || '';
    this.configurarColumnas();
    this.obtenerTotal();
    this.cargarTickets();
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarTickets();
  }
  busquedaTexto(texto: string) {
    this.busqueda = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {

      this.cargarTickets();

    }, 500);
  }
    obtenerTextoEstatus(estatus: number): string {
    if (estatus === 1) return 'Asignado';
    if (estatus === 2) return 'Contactado';
    if (estatus === 3) return 'Cotizado';
    if (estatus === 4) return 'Cerrado';
    return 'N/A';
  }
  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarTickets();
  }
   altaTicket() {
    const dialogRef = this.dialog.open(ModalTicketPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarTickets();
        this.obtenerTotal();
      }
    });
  }
   formatearFecha(fechaStr: string) {
    if (!fechaStr) return 'Sin confirmar';
    return new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  verDetalle(ticket: any) {
  const dialogRef = this.dialog.open(DetalleTicketPage, {
    width: '750px',
    maxWidth: '105vw',
    backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
    data: { ticket }
  });
  dialogRef.afterClosed().subscribe((huboRecarga: boolean) => {
    if (huboRecarga) this.cargarTickets();
  });
}
}

