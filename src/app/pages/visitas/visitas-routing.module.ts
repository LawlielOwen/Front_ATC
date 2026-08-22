import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitasPage } from './visitas.page';

const routes: Routes = [
  {
    path: '',
    component: VisitasPage
  },  {
    path: 'modal-visita',
    loadChildren: () => import('./modal-visita/modal-visita.module').then( m => m.ModalVisitaPageModule)
  },
  {
    path: 'detalle-visita',
    loadChildren: () => import('./detalle-visita/detalle-visita.module').then( m => m.DetalleVisitaPageModule)
  },
  {
    path: 'completar-visita',
    loadChildren: () => import('./completar-visita/completar-visita.module').then( m => m.CompletarVisitaPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitasPageRoutingModule {}
