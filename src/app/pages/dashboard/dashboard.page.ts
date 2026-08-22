import { Component, OnInit, ViewChild } from '@angular/core';
import { SiderbarComponent } from '../../shared/components/layout/siderbar/siderbar.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { MetricaService } from '../../core/services/Metricas.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../core/services/clientes.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    SiderbarComponent,
    HeaderComponent,
    NgxSonnerToaster,
    NgApexchartsModule, 
    CommonModule,
    FormsModule
  ]
})
export class DashboardPage implements OnInit {
  @ViewChild(SiderbarComponent) sidebar!: SiderbarComponent;

  filtroMonedaConversion: string = 'GLOBAL';
  filtroMonedaTendencia: string = 'GLOBAL';
  public chartOptionsTopProductos: any;
  public chartOptionsBottomProductos: any;
  cargandoTopProductos: boolean = true;
  cargandoBottomProductos: boolean = true;
  datosConversion: any[] = [];
  cargandoConversion: boolean = true;
  estadisticas: any = null;
  cargandoEstadisticas: boolean = true;
  public chartOptionsTendencia: any;
  cargandoTendencia: boolean = true;
  datosProductosEstrella: any[] = [];
  cargandoProductosEstrella: boolean = true;
  idClienteFiltroEstrella: number | null = null;
  listaClientes: any[] = [];
  clientesFiltradosSelect: any[] = [];
  busquedaCliente: string = '';       
  mostrarDropdown: boolean = false;   
  idClienteFiltroConversion: number | null = null;
  clienteSeleccionadoNombreConversion: string = 'Vista Global (Todos)';
  mostrarDropdownConversion: boolean = false;
  busquedaClienteConversion: string = '';
  clientesFiltradosSelectConversion: any[] = [];
  clienteSeleccionadoNombre: string = 'Vista Global (Todos)';
  fechaInicioTendencia: string = ''; 
  fechaFinTendencia: string = '';
  constructor(private ms: MetricaService, private cs: ClientesService) {
    this.inicializarGraficaTopProductos();
    this.inicializarGraficaBottomProductos();
    this.inicializarGraficaTendencia();

  }

  ngOnInit() {
  }
  cambiarFiltroConversion(moneda: string) {
    this.filtroMonedaConversion = moneda;
    this.cargarConversion();
  }
cargarClientes() {
    let idUsuarioActual = null;
    let rolUsuario = '';
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        idUsuarioActual = payload.id;
        rolUsuario = payload.Rol;
      } catch (error) {
        console.error('Error al decodificar token en cargarClientes', error);
      }
    }

    this.cs.getClientes(1, 1000).subscribe({
      next: (response: any) => {
        const datosCrudos = response.clientes || response.data || response || [];
        
        if (Array.isArray(datosCrudos)) {
          let clientesActivos = datosCrudos.filter((c: any) => c.estatus === 1 || c.Estatus === 1);

          if (rolUsuario === 'Asesor' && idUsuarioActual) {
            clientesActivos = clientesActivos.filter((c: any) => c.id_asesor === idUsuarioActual);
          }

          this.listaClientes = clientesActivos;
          this.clientesFiltradosSelect = this.listaClientes;
          
          this.clientesFiltradosSelectConversion = this.listaClientes; 
        }
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }
  filtrarClientesLocal() {
    if (!this.busquedaCliente.trim()) {
      this.clientesFiltradosSelect = this.listaClientes;
      return;
    }
    
    const busqueda = this.busquedaCliente.toLowerCase();
    this.clientesFiltradosSelect = this.listaClientes.filter(cliente => 
      cliente.Nombre.toLowerCase().includes(busqueda)
    );
  }
  seleccionarCliente(id: number | null, nombre: string) {
    this.idClienteFiltroEstrella = id;
    this.clienteSeleccionadoNombre = nombre;
    
    this.mostrarDropdown = false; 
    this.busquedaCliente = '';    
    this.clientesFiltradosSelect = this.listaClientes; 
    
    this.cargarProductosEstrella();
  }
  ionViewWillEnter() {
    this.cargarTopProductos();
    this.cargarBottomProductos();
    this.cargarConversion();
    this.cargarTendencia();
    this.cargarProductosEstrella();
    this.cargarClientes();
  }
 cambiarFiltroTendencia(moneda: string) {
    this.filtroMonedaTendencia = moneda;
    this.cargarTendencia(); 
  }
  aplicarFiltroFechasTendencia() {
    this.cargarTendencia();
  }
  inicializarGraficaTopProductos() {
    this.chartOptionsTopProductos = {
      series: [{
        name: "Vendidas",
        data: []
      }],
      chart: {
        type: "bar",
        height: 216,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: '62%',
          borderRadius: 6
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          const producto = w.globals.labels[dataPointIndex];
          const cantidad = series[seriesIndex][dataPointIndex];

          return `
            <div style="background-color: #ffffff; color: #0d1f38; padding: 8px 12px; border-radius: 10px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-weight: 500; margin-right: 4px;">${producto}:</span> 
              <span style="color: #003B8A;">${cantidad} piezas</span>
            </div>
          `;
        }
      },
      colors: [
        "#1a5094", // Azul más oscuro
        "#3b6ba5",
        "#6b8cb7",
        "#93aecb",
        "#becfdf"  // Azul más claro
      ],
      xaxis: {
        categories: [],
        labels: {
          style: { colors: '#64748b' }
        },
        axisBorder: { show: true, color: '#e2e8f0' },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#0d1f38',
            fontWeight: 600
          }
        }
      },
      grid: {
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: {
          top: -15,    
          bottom: -10, 
          left: 10,
          right: 15
        }
      }
    };
  }
cargarTopProductos(meses: number = 3) {
  this.cargandoTopProductos = true;
  this.ms.getProductosTop(meses).subscribe({
    next: (data) => {
      const nombres = data.map(item => item.Nombre);
      const cantidades = data.map(item => Number(item.total_piezas));
      const maxValor = cantidades.length ? Math.max(...cantidades) : 1;

      this.chartOptionsTopProductos.series = [{
        name: 'Vendidas',
        data: cantidades
      }];
      this.chartOptionsTopProductos.xaxis = {
        ...this.chartOptionsTopProductos.xaxis,
        categories: nombres,
        min: 0,
        tickAmount: Math.max(1, Math.min(5, maxValor)),
        labels: {
          style: { colors: '#64748b' },
          formatter: (val: number) => Math.round(val).toString()
        }
      };

      this.cargandoTopProductos = false;
    },
    error: (err) => {
      console.error("Error al cargar el Top de Productos", err);
      this.cargandoTopProductos = false;
    }
  });
}

cargarBottomProductos(meses: number = 3) {
  this.cargandoBottomProductos = true;
  this.ms.getProductosMenosVendidos(meses).subscribe({
    next: (data) => {
      const nombres = data.map(item => item.Nombre);
      const cantidades = data.map(item => Number(item.total_piezas));
      const maxValor = cantidades.length ? Math.max(...cantidades) : 1;

      this.chartOptionsBottomProductos.series = [{
        name: 'Vendidas',
        data: cantidades
      }];
      this.chartOptionsBottomProductos.xaxis = {
        ...this.chartOptionsBottomProductos.xaxis,
        categories: nombres,
        min: 0,
        tickAmount: Math.max(1, Math.min(5, maxValor)),
        labels: {
          style: { colors: '#64748b' },
          formatter: (val: number) => Math.round(val).toString()
        }
      };

      this.cargandoBottomProductos = false;
    },
    error: (err) => {
      console.error("Error al cargar el Bottom de Productos", err);
      this.cargandoBottomProductos = false;
    }
  });
}
  mostrarSidebarMobile() {
    if (this.sidebar) {
      this.sidebar.toggleMenu();
    }
  }
  inicializarGraficaBottomProductos() {
    this.chartOptionsBottomProductos = {
      series: [{
        name: "Vendidas",
        data: []
      }],
      chart: {
        type: "bar",
        height: 216,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: '62%',
          borderRadius: 6
        }
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      // Tooltip blanco (igual al anterior)
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          const producto = w.globals.labels[dataPointIndex];
          const cantidad = series[seriesIndex][dataPointIndex];

          return `
            <div style="background-color: #ffffff; color: #0d1f38; padding: 8px 12px; border-radius: 10px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-weight: 500; margin-right: 4px;">${producto}:</span> 
              <span style="color: #ea580c;">${cantidad} piezas</span>
            </div>
          `;
        }
      },
      colors: [
        "#c2410c",
        "#ea580c",
        "#f97316",
        "#fb923c",
        "#fdba74" 
      ],
      xaxis: {
        categories: [],
        labels: { style: { colors: '#64748b' } },
        axisBorder: { show: true, color: '#e2e8f0' },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { colors: '#0d1f38', fontWeight: 600 } }
      },
      grid: {
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: {
          top: -15,    // <-- Recortamos márgenes
          bottom: -10,
          left: 10,
          right: 15
        }
      }
    };
  }

  cargarConversion() {
    this.cargandoConversion = true;
    this.ms.getTasaConversion(this.filtroMonedaConversion, this.idClienteFiltroConversion).subscribe({
      next: (data) => {
        this.datosConversion = data.slice(0, 7).map((item: any) => {
          const cotizado = Number(item.Cotizado);
          const vendido = Number(item.Vendido);

          let porcentaje = 0;
          if (cotizado > 0) {
            porcentaje = Math.round((vendido / cotizado) * 100);
          } else if (cotizado === 0 && vendido > 0) {
            porcentaje = 100;
          }
          const porcentajeVisual = porcentaje > 100 ? 100 : porcentaje;

          return {
            cliente: item.Cliente,
            cotizado: cotizado,
            vendido: vendido,
            porcentaje: porcentaje,
            porcentajeVisual: porcentajeVisual
          };
        });

        this.cargandoConversion = false;
      },
      error: (err) => {
        console.error("Error al cargar la conversión", err);
        this.cargandoConversion = false;
      }
    });
  }

  inicializarGraficaTendencia() {
    this.chartOptionsTendencia = {
      series: [
        {
          name: "Monto",
          type: "column",
          data: []
        },
        {
          name: "Tendencia",
          type: "line",
          data: []
        }
      ],
      chart: {
        type: "line",
        height: 320,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        zoom: { enabled: false }
      },

      colors: ['#93aecb', '#003B8A'],

      stroke: {
        width: [0, 4],
        curve: 'smooth'
      },
      plotOptions: {
        bar: {
          columnWidth: '38%',
          borderRadius: 6
        }
      },

      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.85 
          }
        },
        active: {
          filter: {
            type: 'none'
          }
        }
      },

      markers: {
        size: [0, 6],
        colors: ["#003B8A"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: 8 }
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: {
        categories: [],
        labels: { style: { colors: '#64748b', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false },

        tooltip: { enabled: false },
        crosshairs: { show: false }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          style: { colors: '#0d1f38', fontWeight: 600 },
          formatter: function (val: any) {
            return "$" + val.toLocaleString('es-MX');
          }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const categorias = w.globals.categoryLabels || w.config.xaxis.categories || [];
          const mes = categorias[dataPointIndex];
          const monto = series[0][dataPointIndex];

          const divisa = this.filtroMonedaTendencia === 'USD' ? 'USD' : 'MXN';

          return `
            <div style="background-color: #ffffff; color: #0d1f38; padding: 10px 14px; border-radius: 10px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <span style="color: #64748b; font-weight: 500; display: block; margin-bottom: 4px;">Período: ${mes}</span> 
              <span style="color: #003B8A; font-size: 14px;">$${monto.toLocaleString('es-MX')} ${divisa}</span>
            </div>
          `;
        }
      },
      grid: {
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      }
    };
  }

  cargarTendencia() {
    this.cargandoTendencia = true;

    this.ms.getTendenciaCotizaciones(this.filtroMonedaTendencia).subscribe({
      next: (data) => {
        let periodos = data.map((item: any) => item.Mes);
        let montos = data.map((item: any) => Number(item.Monto_Cotizado));

        if (periodos.length === 1) {
          periodos.unshift('Inicio');
          montos.unshift(0);
        }

        this.chartOptionsTendencia.series = [
          { name: 'Monto', type: 'column', data: montos },
          { name: 'Tendencia', type: 'line', data: montos }
        ];

        this.chartOptionsTendencia.xaxis = { categories: periodos };
        this.cargandoTendencia = false;
      },
      error: (err) => {
        console.error("Error al cargar la tendencia", err);
        this.cargandoTendencia = false;
      }
    });
  }
  alCambiarClienteFiltro(event: any) {
    const valor = event.target.value;

    this.idClienteFiltroEstrella = valor === 'null' || valor === '' ? null : Number(valor);

    this.cargarProductosEstrella();
  }

  cargarProductosEstrella() {
    this.cargandoProductosEstrella = true;

    this.ms.getProductosEstrella(this.idClienteFiltroEstrella).subscribe({
      next: (data) => {
        this.datosProductosEstrella = data;
        this.cargandoProductosEstrella = false;
      },
      error: (err) => {
        console.error("Error al cargar productos estrella", err);
        this.cargandoProductosEstrella = false;
      }
    });
  }
  filtrarClientesLocalConversion() {
    if (!this.busquedaClienteConversion.trim()) {
      this.clientesFiltradosSelectConversion = this.listaClientes;
      return;
    }
    const busqueda = this.busquedaClienteConversion.toLowerCase();
    this.clientesFiltradosSelectConversion = this.listaClientes.filter(cliente => 
      cliente.Nombre.toLowerCase().includes(busqueda)
    );
  }

  seleccionarClienteConversion(id: number | null, nombre: string) {
    this.idClienteFiltroConversion = id;
    this.clienteSeleccionadoNombreConversion = nombre;
    this.mostrarDropdownConversion = false;
    this.busquedaClienteConversion = '';
    this.clientesFiltradosSelectConversion = this.listaClientes;
    
    this.cargarConversion();
  }
}