import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecepcionesPage } from './recepciones.page';

const routes: Routes = [
  {
    path: '',
    component: RecepcionesPage
  },  {
    path: 'modal-repecion',
    loadChildren: () => import('./modal-repecion/modal-repecion.module').then( m => m.ModalRepecionPageModule)
  },
  {
    path: 'detalles-recepcion',
    loadChildren: () => import('./detalles-recepcion/detalles-recepcion.module').then( m => m.DetallesRecepcionPageModule)
  },
  {
    path: 'confirmar-recepcion',
    loadChildren: () => import('./confirmar-recepcion/confirmar-recepcion.module').then( m => m.ConfirmarRecepcionPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecepcionesPageRoutingModule {}
