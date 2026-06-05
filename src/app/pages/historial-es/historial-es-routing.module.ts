import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialESPage } from './historial-es.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialESPage
  },

  {
    path: 'detalles',
    loadChildren: () => import('./detalles/detalles.module').then( m => m.DetallesPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialESPageRoutingModule {}
