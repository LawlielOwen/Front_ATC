import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsesoresPage } from './asesores.page';

const routes: Routes = [
  {
    path: '',
    component: AsesoresPage
  },  {
    path: 'detalles',
    loadChildren: () => import('./detalles/detalles.module').then( m => m.DetallesPageModule)
  },
  {
    path: 'modal-asesor',
    loadChildren: () => import('./modal-asesor/modal-asesor.module').then( m => m.ModalAsesorPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsesoresPageRoutingModule {}
