import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { StatCardComponent } from '../../shared/components/UI/stat-card/stat-card.component'
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { FiltroDinamicoComponent } from '../../shared/components/UI/Filter/filtro-dinamico/filtro-dinamico.component';
import { FiltroFechaComponent } from '../../shared/components/UI/Filter/filtro-fecha/filtro-fecha.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import { MovimientoService } from '../../core/services/Movimientos.service'
import { DetallesPage } from '../historial-es/detalles/detalles.page'
import { ExistenciasPage } from '../productos/existencias/existencias.page';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';

@Component({
  selector: 'app-historial-es',
  templateUrl: './historial-es.page.html',
  styleUrls: ['./historial-es.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, ButtonLayoutComponent,
    ButtonNewComponent, SearchBarComponent, CountComponent, ContainerTableComponent,
    SearchLayoutComponent, PaginationComponent, FiltroDinamicoComponent, TableComponent, StatCardComponent
    , FiltroFechaComponent, TableSkeletonComponent, CommonModule
  ]
})
export class HistorialESPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  movimientosLista: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
    timeoutBusqueda: any;

  limit: number = 10;
  terminoActual: string = '';
  entradaTipo: string = '';
  destinoTipo: string = '';
  fechaIni: string = '';
  fechaFin: string = '';
  Totalentradas: number = 0;
  Totalsalidas: number = 0;
  Totalvales: number = 0;
  Totalmes: number = 0;
  cargando: boolean = true;

  columnasMov: TableColumn[] = [
    { header: 'Fecha y Hora', key: 'Fecha', type: 'text-light' },
    { header: 'Producto', key: 'Nombre',  type: 'text' },
    { header: 'Tipo', key: 'Tipo', type: 'pill-tipo', align: 'center' },
    { header: 'Cantidad', key: 'cantidad', type: 'cantidad-movimiento', align: 'center' },
    { header: 'Destino', key: 'destino', type: 'pill-destino', align: 'center' },
    { header: 'Asesor', key: 'asesor', type: 'text' }
  ]
  opcionesEntrada = [
    { label: 'Todas', value: '' },
    { label: 'Entradas', value: 'Entrada' },
    { label: 'Salidas', value: 'Salida' }
  ]

  opcionesTipo = [
    { label: 'Todas', value: '' },
    { label: 'Almacen', value: 'Almacen' },
    { label: 'Pedido', value: 'Pedido' },
    {label:'Demostracion', value:'Demostracion'},
  ]
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  constructor(private ms: MovimientoService, private dialog: MatDialog) { }

  ngOnInit() {

  }
  cargarMov() {
    this.cargando = true;
    this.ms.consultarMov(
      this.terminoActual || undefined,
      this.entradaTipo || undefined,
      this.destinoTipo || undefined,
      this.fechaIni || undefined,
      this.fechaFin || undefined,
      this.currentPage,
      this.limit
    ).subscribe({
      next: (response: any) => {
        const datosCrudos = response.movimientos || response.movi || response.m || response.data || [];
       this.movimientosLista = datosCrudos.map((ms: any) => {
          
          const f = new Date(ms.fecha);
          
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
            ...ms,
            Fecha: fechaFormateada,
            Nombre: ms.nombre_producto,
            Marca: `${ms.marca_producto}`,
            Tipo: ms.tipo_movimiento,
            cantidad: `${ms.cantidad} pz`,
            destino: ms.destino,
            asesor: ms.nombre_asesor
          };
        });

        this.totalRecords = response.total || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.limit) || 1;
        this.cargando = false;

      },
      error: (err) => {
        console.error('Error al cargar los movimientos:', err);
        this.cargando = false;
      }
    });
  }
  cargarContador() {
    this.ms.movMensuales().subscribe({
      next: (response: any) => {
        const datos = response[0];
        this.Totalentradas = datos.entradas_mes;
        this.Totalsalidas = datos.salidas_mes;
        this.Totalvales = datos.vales_mes;
        this.Totalmes = datos.registros_mes;
      }
    })
  }
  filtroTipo(tipo: string) {
    this.entradaTipo = tipo;
    this.currentPage = 1;
    this.cargarMov();
  }
  filtroDestino(des: string) {
    this.destinoTipo = des;
    this.currentPage = 1;
    this.cargarMov();
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarMov();
  }
  busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {
      
      this.cargarMov();
      
    }, 500);
  }
filtroFecha(rango: { inicio: any, fin: any }) {
   
    this.fechaIni = rango.inicio;
    this.fechaFin = rango.fin;
    
    this.currentPage = 1;
    this.cargarMov();
  }
  abrirModalEntrada() {
    const dialogRef = this.dialog.open(ExistenciasPage, {
      width: '630px',
      maxWidth: '105vw',
      data: { tipo: 'Entrada' },
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });

    dialogRef.afterClosed().subscribe((exito: boolean) => {
      if (exito) {
        this.cargarMov();
        this.cargarContador();
      }
    });
  }

  abrirModalSalida() {
    const dialogRef = this.dialog.open(ExistenciasPage, {
      width: '630px',
      maxWidth: '105vw',
      data: { tipo: 'Salida' },
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });

    dialogRef.afterClosed().subscribe((exito: boolean) => {
      if (exito) {
        this.cargarMov();
        this.cargarContador();
      }
    });
  }
ionViewWillEnter() {
    this.establecerRangoMesActual();
    this.cargarMov();
    this.cargarContador();
}
  detallesMov(movSeleccionado: any) {
    const dialogRef = this.dialog.open(DetallesPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { m: movSeleccionado }
    });
  }
private establecerRangoMesActual() {
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

  this.fechaIni = this.formatearFechaISO(primerDia);
  this.fechaFin = this.formatearFechaISO(ultimoDia);
}

private formatearFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}
}
