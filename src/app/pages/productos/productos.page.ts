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
import { FiltroDinamicoComponent } from '../../shared/components/UI/Filter/filtro-dinamico/filtro-dinamico.component';
import { TableComponent, TableColumn } from '../../shared/components/UI/table/table.component';
import { TableSkeletonComponent } from '../../shared/components/UI/table/table-skeleton/table-skeleton.component';
import { AuthService } from '../../core/services/auth.service';

import { ProductoService } from '../../core/services/Productos.service'
import { MatDialog } from '@angular/material/dialog';
import { Productos } from "../../shared/model/productos.model";
import { ModalProductoPage } from "../productos/modal-producto/modal-producto.page";
import { DetallesProductoPage } from "../productos/detalles-producto/detalles-producto.page";
import { ExistenciasPage } from "../productos/existencias/existencias.page";
import { DeleteComponent } from '../../shared/components/UI/modal/delete/delete.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [IonicModule, SiderbarComponent, HeaderComponent, ButtonLayoutComponent,
    ButtonNewComponent, SearchBarComponent, EstatusComponent, CountComponent, ContainerTableComponent,
    SearchLayoutComponent, PaginationComponent, FiltroDinamicoComponent, TableComponent, TableSkeletonComponent,
    CommonModule
  ]
})
export class ProductosPage implements OnInit {
 
columnasProductos: TableColumn[] = [];
  productosLista: any[] = [];
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 7;
  p: Productos[] = [];
  terminoActual: string = '';
  marcaActual: number | null = null;
  estatusActual: number | null = 1;
  cargando: boolean = true;
  totalStock: number = 0;
  rolUsuario: string = '';
  user: any;
timeoutBusqueda: any;
  constructor(public dialog: MatDialog, private ps: ProductoService,public authService: AuthService) { }
  opcionesMarcas = [
    { label: 'Todas las marcas', value: null },
    { label: 'SMC', value: 1 },
    { label: 'OMRON', value: 2 },
    { label: 'PATLITE', value: 3 },
    { label: 'WAGO', value: 4 },
    { label: 'RWV', value: 5 },
    { label: 'KLINGSPOR', value: 6 },
    { label: 'KING TONY', value: 7 },
    { label: 'Mighty Seven (m7)', value: 8 },
    { label: 'Fuji Electric', value: 9 }
  ];
  misEstatusDeProductos = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: 1 },
    { label: 'Inactivos', value: 0 },
    { label: 'Sin Stock', value: 2 }
  ];
  definirColumnasPorRol() {
    // Columnas base comunes para todos los empleados
    const columnasBase: TableColumn[] = [
      { header: 'Producto', key: 'Nombre', subKey: 'MarcaModelo', type: 'text' },
      { header: 'Códigos', key: 'CodigoPrincipal', subKey: 'CodigoSecundario', type: 'text' },
      { header: 'Estanteria', key: 'Estanteria', type: 'text', align: 'center' },
      { header: 'Precio', key: 'Precio', type: 'currency', align: 'right' },
      { header: 'Stock', key: 'Stock', type: 'stock', align: 'center' },
      { header: 'Estatus', key: 'EstatusTexto', type: 'status', align: 'center' }
    ];

    const opcionesMenuAutorizadas = [];

    if (this.authService.tieneAcceso(['Administrador', 'Almacen', 'Cotizador'])) {
      opcionesMenuAutorizadas.push({
        accion: 'editar',
        etiqueta: 'Modificar',
      });
    }

    // RESTRICCIÓN 2: "Eliminar" disponible ÚNICAMENTE para el Administrador
    if (this.authService.tieneAcceso(['Administrador'])) {
      opcionesMenuAutorizadas.push({
        accion: 'eliminar',
        etiqueta: 'Eliminar',
        mostrarSi: (row: any) => row.estatus !== 0 && row.Estatus !== 0
      });
    }

    if (opcionesMenuAutorizadas.length > 0) {
      columnasBase.push({
        header: '',
        key: 'acciones',
        type: 'actions',
        align: 'center',
        omitirBase: true,
        menuOptions: opcionesMenuAutorizadas // <--- Le pasamos solo las acciones que su rol permite
      });
    }

    this.columnasProductos = columnasBase;
  }
  ngOnInit() {

  }
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }

  cargarProductos() {
    this.cargando = true;
    this.ps.buscarProductos(
      this.terminoActual,
      this.estatusActual,
      this.marcaActual,
      this.currentPage,
      this.limit
    ).subscribe({
      next: (response: any) => {
        this.productosLista = response.productos.map((pr: Productos) => {
          return {
            ...pr,
            Estanteria: `${pr.Estanteria}`,
            Nombre: `${pr.Nombre}`,
            MarcaModelo: `${pr.Marca}`,
            Modelo: `${pr.Modelo}`,
            Precio: pr.Precio,
            Stock: pr.Stock,
            CodigoPrincipal: `#${pr.Codigo_numeral}`,
            CodigoSecundario: `JP: ${pr.Codigo_japon}`,
            EstatusTexto: this.obtenerTextoEstatus(pr.Estatus)
          }
        })
        this.p = response.productos;
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.limit);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar', err);
        this.cargando = false;
      }
    })
  }
   busquedaTexto(texto: string) {
    this.terminoActual = texto;
    this.currentPage = 1;

    if (this.timeoutBusqueda) {
      clearTimeout(this.timeoutBusqueda);
    }

    this.timeoutBusqueda = setTimeout(() => {
      
      this.cargarProductos();
      
    }, 500);
  }
  filtroEstatus(estatus: number | null) {
    this.estatusActual = estatus;
    this.currentPage = 1;
    this.cargarProductos();
  }
  filtroMarca(marcaId: number | null) {
    this.marcaActual = marcaId;
    this.currentPage = 1;
    this.cargarProductos();
  }
  cambiarPaginaPadre(nuevaPagina: number) {
    this.currentPage = nuevaPagina;
    this.cargarProductos();
  }
  obtenerTotalActivos() {
    this.ps.cantidadProductosStock().subscribe({
      next: (response: any) => {
        this.totalStock = response.total_stock;
      }
    })
  }
  obtenerTextoEstatus(estatus: number): string {
    if (estatus === 1) return 'Activo';
    if (estatus === 2) return 'Sin Stock';
    return 'Inactivo';
  }
  abrirOpciones(evento: { accion: string, row: any }) {
    switch (evento.accion) {
      case 'editar':
        this.abrirModalEdicion(evento.row);
        break;
      case 'eliminar':
        this.eliminarProducto(evento.row);
        break;
    }
  }
  nuevoProducto() {
    const dialogRef = this.dialog.open(ModalProductoPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: []
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarProductos();
        this.obtenerTotalActivos();
      }
    });
  }
  detallesProducto(productoSeleccionado: any) {
    const dialogRef = this.dialog.open(DetallesProductoPage, {
      width: '750px',
      maxWidth: '95vw',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: { producto: productoSeleccionado }
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarProductos();
        this.obtenerTotalActivos();
      }
    });
  }
  registrarExistencia() {
    const dialogRef = this.dialog.open(ExistenciasPage, {
      data: { tipo: 'Entrada' },
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarProductos();
        this.obtenerTotalActivos();
      }
    });
  }
  abrirModalEdicion(productoAEditar: any) {
    const dialogRef = this.dialog.open(ModalProductoPage, {
      width: '630px',
      maxWidth: '105vw',
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      panelClass: [],
      data: { producto: productoAEditar }
    });

    dialogRef.afterClosed().subscribe((necesitaRecargar: boolean) => {
      if (necesitaRecargar) {
        this.cargarProductos();
        this.obtenerTotalActivos();
      }
    });
  }
  eliminarProducto(producto: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '400px',
      panelClass: ['p-0', 'bg-transparent', 'shadow-none'],
      backdropClass: ['bg-black/40', 'backdrop-blur-sm'],
      data: {
        titulo: 'Eliminar Producto',
        mensaje: `¿Estás seguro de que deseas eliminar el producto? Esta acción lo marcará como inactivo.`,
        textoAceptar: 'Eliminar',
        textoCancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.ps.deleteProducto(producto.id).subscribe({
          next: (response: any) => {
            toast.success('Producto eliminado correctamente');

            this.cargarProductos();
            this.obtenerTotalActivos();
          },
          error: (err) => {
            console.error('Error al eliminar producto', err);
            toast.error('No se pudo eliminar el producto');
          }
        });
      }
    });
  }
  ionViewWillEnter() {
    this.cargarProductos();
    this.obtenerTotalActivos();
    this.definirColumnasPorRol();
  }
}
