import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemosPage } from './demos.page';

const routes: Routes = [
  {
    path: '',
    component: DemosPage
  },  {
    path: 'modal-demo',
    loadChildren: () => import('./modal-demo/modal-demo.module').then( m => m.ModalDemoPageModule)
  },
  {
    path: 'detalles-demo',
    loadChildren: () => import('./detalles-demo/detalles-demo.module').then( m => m.DetallesDemoPageModule)
  },
  {
    path: 'alta-demo',
    loadChildren: () => import('./alta-demo/alta-demo.module').then( m => m.AltaDemoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemosPageRoutingModule {}
