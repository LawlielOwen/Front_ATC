import { Component, OnInit, ViewChild } from '@angular/core';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { CardComponent } from '../../shared/components/UI/card/card.component';
import { CardLayoutComponent } from '../../shared/components/layout/card-layout/card-layout.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { DetallesClientePage } from './detalles-cliente/detalles-cliente.page';
import { ModalClientePage } from './modal-cliente/modal-cliente.page';
import { ClientesService } from "../../core/services/clientes.service";
import { Cliente } from "../../shared/model/clientes.model";
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { CardSkeletonComponent } from '../../shared/components/UI/card/card-skeleton/card-skeleton.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent,
    ButtonNewComponent, SearchBarComponent,
    EstatusComponent, ButtonLayoutComponent, SearchLayoutComponent, CardComponent,
    CardLayoutComponent, PaginationComponent, CommonModule,
    CardSkeletonComponent, CountComponent]
})
export class ClientesPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  constructor(public dialog: MatDialog, private clientesService: ClientesService,public authService: AuthService) { }
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 9;
  clientes: Cliente[] = [];
  terminoActual: string = '';
  estatusActual: number | null = 1;
  cargando: boolean = true;
  totalActivos: number = 0;
    timeoutBusqueda: any;

  ngOnInit() {
    
  }
  ionViewWillEnter() {
    this.cargarClientes();
    this.obtenerTotalActivos();
  }
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  detallesCliente(id: number) {
    this.clientesService.getCliente(id).subscribe({
      next: (response: any) => {
        const dialogRef = this.dialog.open(DetallesClientePage, {
          width: '750px',
          maxWidth: '95vw', 
          panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
          backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
          data: response
        });

        dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
          if (necesitaRecargar) {
            this.cargarClientes();
            this.obtenerTotalActivos();

          }
        });
      }
    });
  }
  nuevoCliente() {
    const dialogRef = this.dialog.open(ModalClientePage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarClientes();
        this.obtenerTotalActivos();
      }
    });
  }
  cargarClientes() {
    this.cargando = true;
    this.clientesService.buscarClientes(
      this.terminoActual,
      this.estatusActual,
      this.currentPage,
      this.limit
    ).subscribe({
      next: (response: any) => {
        this.clientes = response.clientes;
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.limit);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar', err);
        this.cargando = false;
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
      
      this.cargarClientes();
      
    }, 500);
  }

  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarClientes();
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarClientes();
  }
  obtenerTotalActivos() {
    this.clientesService.cantidadClientesActivos().subscribe({
      next: (response: any) => {
        this.totalActivos = response.total_activos;
      }
    })
  }
}
