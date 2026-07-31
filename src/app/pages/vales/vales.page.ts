import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'; 
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { EstatusComponent } from '../../shared/components/UI/Filter/estatus/estatus.component'
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { SearchBarComponent } from '../../shared/components/UI/search-bar/search-bar.component';
import { SearchLayoutComponent } from '../../shared/components/layout/search-layout/search-layout.component';
import { CountComponent } from '../../shared/components/UI/count/count.component'
import { EtiquetaComponent } from '../../shared/components/UI/etiqueta/etiqueta.component'
import { StatCardComponent } from '../../shared/components/UI/stat-card/stat-card.component'
import { ContainerTableComponent } from '../../shared/components/layout/container-table/container-table.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { FiltroFechaComponent } from '../../shared/components/UI/Filter/filtro-fecha/filtro-fecha.component';


import { MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import { ValeService } from '../../core/services/Vales.service';
import { ValeSalida } from '../../shared/model/vales.model';
import { ModalValePage } from './modal-vale/modal-vale.page';
import { DetallesValePage } from "./detalles-vale/detalles-vale.page";
import { notificacionService } from '../../core/services/Notificaciones.service';
@Component({
  selector: 'app-vales',
  templateUrl: './vales.page.html',
  styleUrls: ['./vales.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, ButtonLayoutComponent,
    ButtonNewComponent, SearchBarComponent, CountComponent, ContainerTableComponent,
    SearchLayoutComponent, PaginationComponent, StatCardComponent
    , FiltroFechaComponent, CommonModule, EtiquetaComponent, EstatusComponent
  ]
})
export class ValesPage implements OnInit, OnDestroy{
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  currentPage: number = 1;
  totalPages: number = 1;
  private socketSub!: Subscription;
  totalRecords: number = 0;
  limit: number = 10;
  terminoActual: string = '';
  estatusActual: number | null = 0;
  fechaIni: string = '';
  fechaFin: string = '';
  cargando: boolean = true;
  Totalpendientes: number = 0;
  Totalaceptados: number = 0;
  Totalrechazados: number = 0;
  Totalmensual: number = 0;
  vales: ValeSalida[] = [];
  idUsuario: number = 0;
  rolUsuario: string = '';
  timeoutBusqueda: any;
  
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  constructor(private vs: ValeService, private dialog: MatDialog,private notiService: notificacionService) { }
  estatusVales = [
    { label: 'Todos', value: null },
    { label: 'Pendientes', value: 0 },
    { label: 'Aceptados', value: 1 },
    { label: 'Rechazados', value: 2 }
  ]
  ngOnInit() {
this.socketSub = this.notiService.escucharActualizacionTabla().subscribe(() => {
      this.cargarVal(); 
      this.cargarContador();
  });
  }
cargarContador() {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Decodificamos el token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const myId = payload.id;
        const myRol = payload.Rol;

        this.vs.obtenerStatsVales(myId, myRol).subscribe({
          next: (res: any) => {
            this.Totalpendientes = res.pendientes;
            this.Totalaceptados = res.aceptados;
            this.Totalrechazados = res.rechazados;
            this.Totalmensual = res.total;
          },
          error: (err) => console.error('Error cargando stats:', err)
        });
      } catch (error) {
        console.error('Error decodificando el token en cargarContador:', error);
      }
    }
  }

  cargarVal() {
    let idAsesorFiltro = null;
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        if (payload && payload.Rol) {
          const rol = payload.Rol.toLowerCase().trim();

          if (rol === 'Asesor' || rol === 'Cotizador') {
            idAsesorFiltro = payload.id;
          }
        }
      } catch (error) {
        console.error('Error decodificando el token en cargarVal:', error);
      }
    }

    this.cargando = true;
    this.vs.buscarVal(
      idAsesorFiltro,
      this.terminoActual,
      this.estatusActual,
      this.fechaIni,
      this.fechaFin,
      this.currentPage,
      this.limit
    ).subscribe({
      next: (response: any) => {
        this.vales = response.vales || [];
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
  getBadgeText(estatus: number): string {
    switch (estatus) {
      case 0: return 'Pendiente';
      case 1: return 'Aceptada';
      case 2: return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  getTipoBorde(estatus: number): 'naranja' | 'verde' | 'rojo' | 'azul' {
    switch (estatus) {
      case 0: return 'naranja';
      case 1: return 'verde';
      case 2: return 'rojo';
      default: return 'azul';
    }
  }
formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'Sin fecha';
    const f = new Date(fecha);
    if (isNaN(f.getTime())) return 'Fecha inválida';

    // 1. Usar getDate en lugar de getUTCDate
    const dia = f.getDate().toString().padStart(2, '0');
    
    // 2. Quitar el timeZone: 'UTC'
    let mes = f.toLocaleString('es-MX', { month: 'long' }).replace('.', '');
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    
    // 3. Usar getHours y getMinutes normales
    let horas = f.getHours();
    const minutos = f.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';

    horas = horas % 12 || 12;
    const horasStr = horas.toString().padStart(2, '0');
    
    return `${dia} ${mes} ${horasStr}:${minutos} ${ampm}`;
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarVal();
  }
busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {
      
      this.cargarVal();
      
    }, 500);
  }
  filtroFecha(rango: { inicio: any, fin: any }) {
    this.fechaIni = rango.inicio;
    this.fechaFin = rango.fin;
    
    this.currentPage = 1;
    this.cargarVal();
  }
  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarVal();
  }
  abrirModalVale() {
    const dialogRef = this.dialog.open(ModalValePage, {
      width: '750px',
      maxWidth: '105vw',
      data: { tipo: 'Entrada' },
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((exito: boolean) => {
      if (exito) {
        this.cargarVal();
        this.cargarContador();
      }
    });
  }
  abrirDetalles(vale: any) {
    const dialogRef = this.dialog.open(DetallesValePage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { vale }
    });
    dialogRef.afterClosed().subscribe((exito: boolean) => {
      if (exito) {
        this.cargarVal();
        this.cargarContador();
      }
    });
  }
  ionViewWillEnter() {
    this.establecerMesActual();
    this.cargarContador();
    this.cargarVal();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.rolUsuario = user.Rol || '';
    this.idUsuario = user.id || 0;

  }
  aceptarValeDirecto(vale: any) {
    const comentarios = 'Aprobado directamente desde la lista';

    this.vs.aceptarVal(vale.id_vale, comentarios, vale.id_asesor).subscribe({
      next: () => {
        toast.success('Vale aceptado exitosamente');
        this.cargarContador();
        this.cargarVal();
      },
      error: (err) => { toast.error('Error al aceptar el vale.'); }
    });
  }

  rechazarValeDirecto(vale: any) {
    const comentarios = 'Rechazado directamente desde la lista';

    this.vs.rechazarVal(vale.id_vale, comentarios, vale.id_asesor).subscribe({
      next: () => {
        toast.success('Vale rechazado exitosamente');
        this.cargarContador();
        this.cargarVal();
      },
      error: (err) => { toast.error('Error al rechazar el vale.'); }
    });
  }
  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
  establecerMesActual() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth(); 
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    const formatear = (fecha: Date) => {
      const y = fecha.getFullYear();
      const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const d = fecha.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    this.fechaIni = formatear(primerDia);
    this.fechaFin = formatear(ultimoDia);
  }
}