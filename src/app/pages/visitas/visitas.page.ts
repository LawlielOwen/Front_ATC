import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { CountComponent } from '../../shared/components/UI/count/count.component';
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import {CompletarVisitaPage} from './completar-visita/completar-visita.page';
import { VisitaService } from '../../core/services/Visitas.service';
import { AuthService } from '../../core/services/auth.service';
import { DetalleVisitaPage } from '../visitas/detalle-visita/detalle-visita.page';
import { ModalVisitaPage } from '../visitas/modal-visita/modal-visita.page';
import { VisitaDemostracion } from '../../shared/model/visita.model';

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.page.html',
  styleUrls: ['./visitas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SiderbarComponent, 
    HeaderComponent, 
    ButtonLayoutComponent,
    ButtonNewComponent, 
    SearchBarComponent, 
    CountComponent, 
    ContainerTableComponent,
    SearchLayoutComponent, 
    PaginationComponent, 
    EstatusComponent,
    TableComponent, 
    TableSkeletonComponent,
    
  ]
})
export class VisitasPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  
  // Tabla y Paginación
  visitasLista: any[] = [];
  columnasVisitas: TableColumn[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  
  // Filtros y Estados
  terminoActual: string = '';
  estatusActual: number | null = null; // null = Todas
  cargando: boolean = true;
  timeoutBusqueda: any;

  opcionesEstatus = [
    { label: 'Todas', value: null },
    { label: 'Programadas', value: 1 },
    { label: 'Completadas', value: 2 },
    { label: 'Canceladas', value: 0 }
  ];

  constructor(
    private vs: VisitaService,
    public authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.definirColumnas();
    this.cargarVisitas();
  }

  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }

  definirColumnas() {
    const columnasBase: TableColumn[] = [
      { header: 'Fecha Programada', key: 'FechaFormat', type: 'text-light' },
      { header: 'Empresa / Destino', key: 'empresa_destino', type: 'text' },
      { header: 'Asesor', key: 'nombre_asesor', type: 'text' },
      { header: 'Estatus', key: 'EstatusTexto', type: 'status', align: 'center' }
    ];

    const opcionesMenuAutorizadas = [];

    // Todos pueden ver detalles
    opcionesMenuAutorizadas.push({
      accion: 'detalles',
      etiqueta: 'Ver Detalles',
    });

    if (this.authService.tieneAcceso(['Administrador', 'Soporte Tecnico'])) {
      // Completar visita (solo si está programada = 1)
      opcionesMenuAutorizadas.push({
        accion: 'completar',
        etiqueta: 'Completar Visita',
        mostrarSi: (row: any) => row.estatus === 1
      });
      
      // Cancelar visita (solo si está programada = 1)
      opcionesMenuAutorizadas.push({
        accion: 'cancelar',
        etiqueta: 'Cancelar Visita',
        mostrarSi: (row: any) => row.estatus === 1
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

    this.columnasVisitas = columnasBase;
  }

cargarVisitas() {
    this.cargando = true;

    this.vs.consultarVisitas(
      this.terminoActual || undefined,
      this.estatusActual ?? undefined,
       undefined, 
      this.currentPage,
      this.limit
    ).subscribe({
      next: (response: any) => {

        const datosCrudos = response.visitas || response.data || response.resultado || response || [];

        this.visitasLista = datosCrudos.map((v: any) => {
          
          const fechaString = v.fecha_visita || v.Fecha || new Date();
          const f = new Date(fechaString);
          
          const dia = f.getDate().toString().padStart(2, '0');
          let mes = f.toLocaleString('es-MX', { month: 'long' }).replace('.', '');
          mes = mes.charAt(0).toUpperCase() + mes.slice(1);
          let horas = f.getHours();
          const minutos = f.getMinutes().toString().padStart(2, '0');
          const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
          horas = horas % 12 || 12;
          const horasStr = horas.toString().padStart(2, '0');
          
          const fechaFormateada = `${dia} ${mes} ${horasStr}:${minutos} ${ampm}`;

          return {
            ...v,
            FechaFormat: fechaFormateada,
            empresa_destino: v.empresa_destino || v.empresa_no_registrada || 'Sin definir',
            nombre_asesor: v.nombre_asesor || 'Sin asesor',
            EstatusTexto: this.obtenerTextoEstatus(v.estatus)
          };
        });

        this.totalRecords = response.total || datosCrudos.length || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.limit) || 1;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar visitas:', err);
        this.cargando = false;
        toast.error('Ocurrió un error al cargar las visitas.');
      }
    });
  }
  obtenerTextoEstatus(estatus: number): string {
    if (estatus === 1) return 'Programada';
    if (estatus === 2) return 'Completada';
    return 'Cancelada';
  }

  // --- FILTROS Y PAGINACIÓN ---

  busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) clearTimeout(this.timeoutBusqueda);

    this.timeoutBusqueda = setTimeout(() => {
      this.cargarVisitas();
    }, 500);
  }

  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarVisitas();
  }

  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarVisitas();
  }

  // --- ACCIONES Y MODALES ---

  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'detalles':
        this.abrirDetalles(evento.row);
        break;
      case 'completar':
        this.completarVisita(evento.row);
        break;
      case 'cancelar':
        this.cancelarVisita(evento.row);
        break;
    }
  }

  nuevaVisita() {
    const dialogRef = this.dialog.open(ModalVisitaPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarVisitas();
      }
    });
  }

  abrirDetalles(visita: any) {
    const dialogRef = this.dialog.open(DetalleVisitaPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { visita: visita }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarVisitas();
      }
    });
  }

  completarVisita(visita: any) {
  const dialogRef = this.dialog.open(CompletarVisitaPage, {
    width: '600px',
    maxWidth: '95vw',
    panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
    backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
    data: { visita }
  });

  dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
    if (necesitaRecargar) {
      this.cargarVisitas();
    }
  });
}

cancelarVisita(visita: any) {
  const dialogRef = this.dialog.open(DeleteComponent, {
    width: '400px',
    panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
    backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
    data: {
      titulo: 'Cancelar Visita',
      mensaje: `¿Estás seguro de que deseas cancelar la visita a "${visita.empresa_destino}"? Esta acción no se puede deshacer.`,
      textoAceptar: 'Cancelar Visita',
      textoCancelar: 'Regresar'
    }
  });

  dialogRef.afterClosed().subscribe((confirmado: boolean) => {
    if (confirmado) {
      this.vs.cancelarVisita(visita.id_visita).subscribe({
        next: () => {
          toast.success('Visita cancelada correctamente');
          this.cargarVisitas();
        },
        error: () => toast.error('Error al cancelar la visita')
      });
    }
  });
}
}