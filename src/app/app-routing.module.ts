import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guard/Role.guard';
import { noAuthGuard } from './core/guard/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canActivate: [noAuthGuard]
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
   
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'asesores',
    loadChildren: () => import('./pages/asesores/asesores.module').then( m => m.AsesoresPageModule),
    canActivate: [roleGuard(['Administrador'])]
  },


  {
    path: 'productos',
    loadChildren: () => import('./pages/productos/productos.module').then( m => m.ProductosPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'clientes',
    loadChildren: () => import('./pages/clientes/clientes.module').then( m => m.ClientesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'cotizaciones',
    loadChildren: () => import('./pages/cotizaciones/cotizaciones.module').then( m => m.CotizacionesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'historial-es',
    loadChildren: () => import('./pages/historial-es/historial-es.module').then( m => m.HistorialESPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'vales',
    loadChildren: () => import('./pages/vales/vales.module').then( m => m.ValesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'recepciones',
    loadChildren: () => import('./pages/recepciones/recepciones.module').then( m => m.RecepcionesPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'pedidos',
    loadChildren: () => import('./pages/pedidos/pedidos.module').then( m => m.PedidosPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'tickets',
    loadChildren: () => import('./pages/tickets/tickets.module').then( m => m.TicketsPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'no-autorizado',
    loadChildren: () => import('./pages/no-autorizado/no-autorizado.module').then( m => m.NoAutorizadoPageModule)
  },
  {
    path: 'demos',
    loadChildren: () => import('./pages/demos/demos.module').then( m => m.DemosPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'visitas',
    loadChildren: () => import('./pages/visitas/visitas.module').then( m => m.VisitasPageModule),
    canActivate: [authGuard]
  },  {
    path: 'proyectos',
    loadChildren: () => import('./pages/proyectos/proyectos.module').then( m => m.ProyectosPageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }