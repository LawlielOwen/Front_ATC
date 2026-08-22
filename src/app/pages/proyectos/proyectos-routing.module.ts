import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProyectosPage } from './proyectos.page';

const routes: Routes = [
  {
    path: '',
    component: ProyectosPage
  },
  {
    path: 'alta-proyecto',
    loadChildren: () => import('./alta-proyecto/alta-proyecto.module').then( m => m.AltaProyectoPageModule)
  },
  {
    path: 'detalles-proyecto',
    loadChildren: () => import('./detalles-proyecto/detalles-proyecto.module').then( m => m.DetallesProyectoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProyectosPageRoutingModule {}
