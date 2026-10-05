import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { finalize, forkJoin } from 'rxjs';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { ButtonLayoutComponent } from '../../shared/components/layout/button-layout/button-layout.component';
import { ButtonNewComponent } from '../../shared/components/UI/buttons/button/button-new.component';
import { CountComponent } from '../../shared/components/UI/count/count.component';
import { UbicacionCardComponent, TipoUbicacion } from '../../shared/components/UI/ubicacion-card/ubicacion-card.component';
import { PaginationComponent } from '../../shared/components/UI/pagination/pagination.component';
import { AuthService } from '../../core/services/auth.service';
import { ProductoService } from '../../core/services/Productos.service';
import { Ubicacion } from '../../shared/model/productos.model';
import { toast } from 'ngx-sonner';
import { mostrarAgregarUbicacion, confirmarDesactivarUbicacion,confirmarReactivarUbicacion} from '../../shared/utils/ubicacion-alerts.util';
type FiltroEstatus = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.page.html',
  styleUrls: ['./ubicaciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SiderbarComponent,
    HeaderComponent,
    ButtonLayoutComponent,
    ButtonNewComponent,
    CountComponent,
    UbicacionCardComponent,
    PaginationComponent
  ],
})
export class UbicacionesPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;

  tab: TipoUbicacion = 'estanteria';
  filtro: FiltroEstatus = 'todos';
  filtros: { label: string; valor: FiltroEstatus }[] = [
    { label: 'Todas', valor: 'todos' },
    { label: 'Activas', valor: 'activos' },
    { label: 'Inactivas', valor: 'inactivos' },
  ];

  ubicaciones: Ubicacion[] = [];
  currentPage = 1;
  totalPages = 1;
  limit = 9;
  totalRegistros = 0;
  totalActivas = 0;
  totalEstanterias = 0;
  totalCajas = 0;
  cargando = false;

  constructor(
    public authService: AuthService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.cargar();
    this.cargarTotalesGenerales();
    this.cargarTotalActivas();
  }

  cargar() {
    this.cargando = true;
    this.productoService.consultarUbicaciones(this.tab, this.filtro, this.currentPage, this.limit).pipe(
      finalize(() => this.cargando = false)
    ).subscribe({
      next: (res) => {
        this.ubicaciones = res.ubicaciones || [];
        this.totalRegistros = Number(res.paginacion?.total || 0);
        this.totalPages = Number(res.paginacion?.total_paginas || 1);
        this.currentPage = Number(res.paginacion?.pagina || 1);
      },
      error: (err) => {
        console.error('Error al cargar ubicaciones', err);
        this.ubicaciones = [];
        this.totalRegistros = 0;
        this.totalPages = 1;
        toast.error('No se pudieron cargar las ubicaciones');
      }
    });
  }

  cargarTotalesGenerales() {
    forkJoin({
      estanterias: this.productoService.consultarUbicaciones('estanteria', 'todos', 1, 1),
      cajas: this.productoService.consultarUbicaciones('caja', 'todos', 1, 1)
    }).subscribe({
      next: (res) => {
        this.totalEstanterias = Number(res.estanterias.paginacion?.total || 0);
        this.totalCajas = Number(res.cajas.paginacion?.total || 0);
      },
      error: (err) => console.error('Error al cargar totales', err)
    });
  }

  cargarTotalActivas() {
    this.productoService.consultarUbicaciones(this.tab, 'activos', 1, 1).subscribe({
      next: (res) => this.totalActivas = Number(res.paginacion?.total || 0),
      error: (err) => {
        console.error('Error al cargar total activo', err);
        this.totalActivas = 0;
      }
    });
  }

  cambiarTab(tipo: TipoUbicacion) {
    if (this.tab === tipo) return;
    this.tab = tipo;
    this.filtro = 'todos';
    this.currentPage = 1;
    this.cargar();
    this.cargarTotalActivas();
  }

  cambiarFiltro(filtro: FiltroEstatus) {
    if (this.filtro === filtro) return;
    this.filtro = filtro;
    this.currentPage = 1;
    this.cargar();
  }

  cambiarPaginaPadre(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages || nuevaPagina === this.currentPage) return;
    this.currentPage = nuevaPagina;
    this.cargar();
  }
agregar(tipo: TipoUbicacion) {
  mostrarAgregarUbicacion(tipo).then(datos => {
    if (!datos) return;

    const peticion = tipo === 'estanteria'
      ? this.productoService.agregarEstanteria(datos.codigo, datos.descripcion)
      : this.productoService.agregarCaja(datos.codigo, datos.descripcion);

    peticion.subscribe({
      next: (res) => {
        toast.success(res.mensaje);
        this.refrescar();
      },
      error: (err) => {
        toast.error(
          err.error?.error ||
          `No se pudo registrar la ${tipo === 'estanteria' ? 'estantería' : 'caja'}`
        );
      }
    });
  });
}

async confirmarCambioEstatus(u: Ubicacion) {
  const activa = Number(u.estatus) === 1;

  const confirmado = activa
    ? await confirmarDesactivarUbicacion(this.tab, u)
    : await confirmarReactivarUbicacion(this.tab, u);

  if (!confirmado) return;

  if (this.tab === 'estanteria') {
    const peticion = activa
      ? this.productoService.desactivarEstanteria(u.id)
      : this.productoService.agregarEstanteria(u.codigo, u.descripcion);

    peticion.subscribe({
      next: (res) => {
        toast.success(res.mensaje);
        this.refrescar();
      },
      error: (err) => toast.error(
        err.error?.error ||
        'No se pudo actualizar la estantería'
      )
    });

    return;
  }

  const peticion = activa
    ? this.productoService.desactivarCaja(u.id)
    : this.productoService.agregarCaja(u.codigo, u.descripcion);

  peticion.subscribe({
    next: (res) => {
      toast.success(res.mensaje);
      this.refrescar();
    },
    error: (err) => toast.error(
      err.error?.error ||
      'No se pudo actualizar la caja'
    )
  });
}

  private refrescar() {
    this.cargar();
    this.cargarTotalesGenerales();
    this.cargarTotalActivas();
  }

  trackById(_: number, u: Ubicacion) {
    return u.id;
  }

  mostrarSidebarMobile() {
    if (this.sidebar) this.sidebar.toggleMenu();
  }
}