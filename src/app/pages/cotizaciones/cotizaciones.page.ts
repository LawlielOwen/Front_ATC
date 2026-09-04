import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { FiltroDinamicoComponent } from '../../shared/components/UI/Filter/filtro-dinamico/filtro-dinamico.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import { AceptarComponent } from '../../shared/components/UI/modal/aceptar/aceptar.component';
import { StatCardComponent } from '../../shared/components/UI/stat-card/stat-card.component'
import { toast } from 'ngx-sonner';
import { FiltroFechaComponent } from '../../shared/components/UI/Filter/filtro-fecha/filtro-fecha.component';
import { Router } from '@angular/router';
import { CotizacionService } from '../../core/services/Cotizaciones.service'
import Swal from 'sweetalert2';
import { DetallesCotizacionPage } from './detalles-cotizacion/detalles-cotizacion.page'
import { solicitarOrdenCompra, confirmarRegistroCliente } from '../../shared/utils/cotizacion-alerts.util';
import { ModalClientePage } from '../clientes/modal-cliente/modal-cliente.page'
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.page.html',
  styleUrls: ['./cotizaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, NgxSonnerToaster, ButtonLayoutComponent,
    ButtonNewComponent, CountComponent, ContainerTableComponent, TableComponent, StatCardComponent, SearchLayoutComponent,
    EstatusComponent, SearchBarComponent, TableSkeletonComponent, PaginationComponent, CommonModule, FiltroFechaComponent,
    FiltroDinamicoComponent,
  ]
})
export class CotizacionesPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
    user: any;
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  terminoActual: string = '';
  estatusActual: number | null = 1;
  fechaIni: string = '';
  fechaFin: string = '';
  orden: string = '';
  timeoutBusqueda: any;

  cargando: boolean = true;
  Totalcanceladas: number = 0;
  Totalpendientes: number = 0;
  Totalaceptadas: number = 0;
  Totalmensual: number = 0;
  idUsuario: number = 0;
  rolUsuario: string = '';
  cotizacionesLista: any[] = [];
  EstatusCotizacion = [
    { label: 'Todos', value: null },
    { label: 'Pendientes', value: 1 },
    { label: 'Canceladas', value: 0 },
    { label: 'Aceptadas', value: 2 }
  ];
  OrdenCot = [
    { label: 'Todos', value: null },
    { label: 'Mayor a menor precio', value: 'DESC' },
    { label: 'Menor a mayor precio', value: 'ASC' }
  ]

  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  constructor(private cs: CotizacionService, public dialog: MatDialog, private router: Router, public authService: AuthService) { }
  columnasCotizaciones: TableColumn[] = [];

  definirColumnasPorRol() {
    // Columnas base, iguales para todos los roles
    const columnasBase: TableColumn[] = [
      { header: 'Folio', key: 'num_cotizacion', type: 'text' },
      { header: 'Cliente', key: 'nombre_cliente_final', type: 'text-light' },
      { header: 'Fecha', key: 'fecha_formateada', type: 'text-light' },
      { header: 'Total', key: 'total_formateado', subKey: 'moneda', type: 'text-light' },
      { header: 'Estatus', key: 'estatusTexto', type: 'status', align: 'center' }
    ];

    const usuarioActual = this.authService.obtenerUsuarioActual();
    const esCotizadorOAdmin = this.authService.tieneAcceso(['Cotizador', 'Administrador']);

    const opcionesMenuAutorizadas: any[] = [
      { accion: 'ver_pdf', etiqueta: 'Ver PDF' },
      {
        accion: 'aceptar',
        etiqueta: 'Aceptar',
        mostrarSi: (row: any) =>
          row.Estatus === 1 &&
          (esCotizadorOAdmin || row.id_asesor === usuarioActual?.id)
      },
      {
        accion: 'cancelar',
        etiqueta: 'Cancelar',
        mostrarSi: (row: any) =>
          row.Estatus === 1 &&
          (esCotizadorOAdmin || row.id_asesor === usuarioActual?.id)
      }
    ];

    columnasBase.push({
      header: '',
      key: 'acciones',
      type: 'actions',
      align: 'center',
      omitirBase: true,
      menuOptions: opcionesMenuAutorizadas
    });

    this.columnasCotizaciones = columnasBase;
}
  ngOnInit() {

  }
  ionViewWillEnter() {
    this.establecerRangoMesActual();
    this.cargarCotizaciones();
    this.cargarEstadisticas();
    this.definirColumnasPorRol();
  }
  irAPos() {
    this.router.navigate(['/cotizaciones/pos']);
  }
  cargarEstadisticas() {
    this.cs.obtenerEstadisticasMensuales().subscribe({
      next: (data: any) => {
        const estadisticas = (Array.isArray(data) && data.length > 0) ? data[0] : (data || {});

        this.Totalaceptadas = parseInt(estadisticas?.aceptadas) || 0;
        this.Totalcanceladas = parseInt(estadisticas?.canceladas) || 0;
        this.Totalpendientes = parseInt(estadisticas?.pendientes) || 0;

        this.Totalmensual = parseInt(estadisticas?.total_mes) || 0;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.Totalaceptadas = 0;
        this.Totalcanceladas = 0;
        this.Totalpendientes = 0;
        this.Totalmensual = 0;
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
  obtenerTextoEstatus(estatus: number): string {
    const mapaEstatus: Record<number, string> = {
      0: 'Cancelada',
      1: 'Pendiente',
      2: 'Aceptada'
    };
    return mapaEstatus[estatus] || 'Desconocido';
  }
  cargarCotizaciones() {
    this.cargando = true;

    this.cs.buscarCotizacion(
      this.terminoActual,
      this.estatusActual,
      this.fechaIni,
      this.fechaFin, 
      this.orden,
      this.currentPage,
      this.limit
    ).subscribe({
      next: (res: any) => {
        const listaCruda = res.c || res.cot || res.cotizaciones || [];
        this.cotizacionesLista = listaCruda.map((cot: any) => ({
          ...cot,
          nombre_cliente_final: cot.nombre_cliente_final || 'Sin Nombre',
          fecha_formateada: this.formatearFecha(cot.fecha),
          total_formateado: new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: cot.moneda === 'USD' ? 'USD' : 'MXN',
            currencyDisplay: 'narrowSymbol' as any
          }).format(cot.total),
          estatusTexto: this.obtenerTextoEstatus(cot.Estatus)
        }));

        this.totalRecords = res.total || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.limit) || 1;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar las cotizaciones:', err);
        this.cargando = false;
      }
    });
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarCotizaciones();
  }
  busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {

      this.cargarCotizaciones();

    }, 500);
  }
  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarCotizaciones();
  }
  filtroFecha(rango: { inicio: any, fin: any }) {
    this.fechaIni = rango.inicio;
    this.fechaFin = rango.fin;
    this.currentPage = 1;
    this.cargarCotizaciones();
  }
  ordenarCot(texto: string) {
    this.orden = texto;
    this.currentPage = 1;
    this.cargarCotizaciones();
  }
  detallesCot(coti: any) {
    const dialogRef = this.dialog.open(DetallesCotizacionPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { cot: coti }
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarCotizaciones();
        this.cargarEstadisticas();
      }
    });
  }
  cancelarCotizacion(cot: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Cancelar Cotizacion',
        mensaje: `¿Estás seguro de que deseas cancelar la cotizacion?`,
        textoAceptar: 'Aceptar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.cs.cancelarCotizacion(cot.id).subscribe({
          next: (response: any) => {
            toast.success('Cotizacion cancelada');

            this.cargarCotizaciones();
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
vincularYConvertir(idCotizacion: number, idNuevoCliente: number, orden_compra: string = '') {
  this.cs.vincularClienteCotizacion(idCotizacion, idNuevoCliente).subscribe({
    next: () => {
      this.ejecutarConversionSp(idCotizacion, orden_compra);
    },
    error: (err) => {
      toast.error('Error al vincular el cliente con la cotización.');
      console.error(err);
    }
  });
}

ejecutarConversionSp(idCotizacion: number, oc: string = '') {
  this.cs.convertirAPedido(idCotizacion, oc).subscribe({
    next: (response: any) => {
      toast.success('Cotización convertida a pedido exitosamente');
      this.cargarCotizaciones();
      this.cargarEstadisticas();
    },
    error: (err) => {
      console.error('Error al aceptar', err);
      toast.error(err.error?.error || 'Error al convertir a pedido.');
    }
  });
}

aceptarCotizacion(cot: any) {
  if (!cot.id_cliente) {
    confirmarRegistroCliente(cot.nombre_prospecto || cot.Cliente).then((deseaRegistrar) => {
      if (!deseaRegistrar) return; 
    const nombreCliente = cot.nombre_cliente_final && cot.nombre_cliente_final !== 'Sin Nombre'
          ? cot.nombre_cliente_final
          : (cot.nombre_prospecto || cot.Cliente || '');
      const dialogRef = this.dialog.open(ModalClientePage, {
        width: '630px',
        maxWidth: '105vw',
        panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
        backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
       data: {
            nombrePrellenado: nombreCliente,
            idAsesorPrellenado: cot.id_asesor
          }
      });

      dialogRef.afterClosed().subscribe((nuevoIdCliente) => {
        if (nuevoIdCliente && typeof nuevoIdCliente === 'number') {
          solicitarOrdenCompra().then((ordenCompra) => {
            if (ordenCompra !== null) {
              this.vincularYConvertir(cot.id, nuevoIdCliente, ordenCompra);
            }
          });
        }
      });
    });

    return;
  }

  solicitarOrdenCompra().then((ordenCompra) => {
    if (ordenCompra !== null) {
      this.ejecutarConversionSp(cot.id, ordenCompra);
    }
  });
}

  abrirPdf(idCotizacion: number) {
    Swal.fire({
      title: 'Abriendo documento...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.cs.verPdfCotizacion(idCotizacion).subscribe({
      next: (blob: Blob) => {
        Swal.close();

        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(pdfBlob);

        const a = document.createElement('a');
        a.href = fileURL;
        a.target = '_blank'; 

        document.body.appendChild(a);
        a.click(); 

        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
      },
      error: (err) => {
        Swal.close();
        console.error('Error al obtener el PDF:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el documento.'
        });
      }
    });
  }

  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'ver_pdf':
        this.abrirPdf(evento.row.id);
        break;
      case 'cancelar':
        this.cancelarCotizacion(evento.row);
        break;
      case 'aceptar':
        this.aceptarCotizacion(evento.row);
        break;
    }
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
