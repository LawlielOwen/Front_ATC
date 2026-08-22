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
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import { toast } from 'ngx-sonner';
import { DemoService } from '../../core/services/Demos.service';
import { StockDemo } from '../../shared/model/demo.model'; 
import { ModalDemoPage } from './modal-demo/modal-demo.page';
import { DetallesDemoPage } from './detalles-demo/detalles-demo.page';
import {AltaDemoPage} from './alta-demo/alta-demo.page';
@Component({
  selector: 'app-demos',
  templateUrl: './demos.page.html',
  styleUrls: ['./demos.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, ButtonLayoutComponent,
    ButtonNewComponent, SearchBarComponent, EstatusComponent, CountComponent, ContainerTableComponent,
    SearchLayoutComponent, PaginationComponent,  TableComponent, TableSkeletonComponent,
    CommonModule
  ]
})
export class DemosPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  
  columnasDemos: TableColumn[] = [];
  demosLista: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 7;
  
  terminoActual: string = '';
  estatusActual: number | null = 1; 
  cargando: boolean = true;
  totalActivos: number = 0;
  timeoutBusqueda: any;

  misEstatusDeDemos = [
    { label: 'Todos', value: null },
    { label: 'Activos / En Oficina', value: 1 },
    { label: 'En Demostración', value: 2 },
    { label: 'Bajas / Inactivos', value: 0 }
  ];

  constructor(
    public dialog: MatDialog, 
    private ds: DemoService,
    public authService: AuthService
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.definirColumnasPorRol();
    this.cargarDemos();
  }

  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }

  definirColumnasPorRol() {
    const columnasBase: TableColumn[] = [
      { header: 'Demo / Modelo', key: 'nombre_modelo', type: 'text' },
      { header: 'Marca', key: 'marca_proveedor', type: 'text', align: 'center' },
      { header: 'Stock', key: 'stock', type: 'stock', align: 'center' },
      { header: 'Estatus', key: 'EstatusTexto', type: 'status', align: 'center' }
    ];

    const opcionesMenuAutorizadas = [];

    if (this.authService.tieneAcceso(['Administrador', 'Soporte Tecnico'])) {
      opcionesMenuAutorizadas.push({
        accion: 'editar',
        etiqueta: 'Modificar',
      });
      
      opcionesMenuAutorizadas.push({
        accion: 'eliminar',
        etiqueta: 'Dar de baja',
        mostrarSi: (row: any) => row.estatus !== 0 
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

    this.columnasDemos = columnasBase;
  }

  cargarDemos() {
    this.cargando = true;
    this.ds.consultarDemos(this.terminoActual, this.estatusActual, null, this.currentPage, this.limit)
      .subscribe({
        next: (response: any) => {
          this.demosLista = response.demos.map((demo: StockDemo) => {
            return {
              ...demo,
              EstatusTexto: this.obtenerTextoEstatus(demo.estatus)
            };
          });
          
          this.totalRecords = response.total;
          this.totalPages = Math.ceil(this.totalRecords / this.limit);
          
          if (this.estatusActual === 1) {
             this.totalActivos = this.totalRecords;
          }
          
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar demos', err);
          this.cargando = false;
          toast.error('Ocurrió un error al cargar el inventario de demos.');
        }
      });
  }

  obtenerTextoEstatus(estatus: number): string {
    if (estatus === 1) return 'Activo';
    if (estatus === 2) return 'En Demostración'; 
    return 'Inactivo';
  }

obtenerTotalActivos() {
    this.ds.consultarDemos('', 1, null, 1, 1).subscribe({
      next: (response: any) => {
        this.totalActivos = response.total;
      }
    });
  }
  busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) clearTimeout(this.timeoutBusqueda);

    this.timeoutBusqueda = setTimeout(() => {
      this.cargarDemos();
    }, 500);
  }

  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarDemos();
  }

  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarDemos();
  }


  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'editar':
        this.editarDemo(evento.row);
        break;
      case 'eliminar':
        this.eliminarDemo(evento.row);
        break;
    }
  }


  nuevoDemo() {
    const dialogRef = this.dialog.open(ModalDemoPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarDemos();
       
      }
    });
  }
 editarDemo(demoAEditar: any) {
    const dialogRef = this.dialog.open(ModalDemoPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: { demo: demoAEditar }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarDemos();
      }
    });
  }

  eliminarDemo(demo: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Dar de baja Demo',
        mensaje: `¿Estás seguro de que deseas dar de baja el demo "${demo.nombre_modelo}"? Esta acción lo marcará como inactivo.`,
        textoAceptar: 'Eliminar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.ds.eliminarDemo(demo.id_demo).subscribe({
          next: () => {
            toast.success('Demo dado de baja correctamente');
            this.cargarDemos();
            this.obtenerTotalActivos(); 
          },
          error: (err) => {
            console.error('Error al dar de baja', err);
            toast.error('No se pudo dar de baja el equipo demo');
          }
        });
      }
    });
  }
  detallesDemo(demoSeleccionado: any) {
    const dialogRef = this.dialog.open(DetallesDemoPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { demo: demoSeleccionado }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarDemos();
            this.obtenerTotalActivos(); 
      }
    });
  }
    registrarExistencia() {
    const dialogRef = this.dialog.open(AltaDemoPage, {
      data: { tipo: 'Entrada' },
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarDemos();
        this.obtenerTotalActivos();
      }
    });
  }
}