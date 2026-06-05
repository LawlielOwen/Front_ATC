import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ValesPage } from './vales.page';

const routes: Routes = [
  {
    path: '',
    component: ValesPage
  },  {
    path: 'modal-vale',
    loadChildren: () => import('./modal-vale/modal-vale.module').then( m => m.ModalValePageModule)
  },
  {
    path: 'detalles-vale',
    loadChildren: () => import('./detalles-vale/detalles-vale.module').then( m => m.DetallesValePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ValesPageRoutingModule {}
