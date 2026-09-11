import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CotizacionesPage } from './cotizaciones.page';

const routes: Routes = [
  {
    path: '',
    component: CotizacionesPage
  },  {
    path: 'detalles-cotizacion',
    loadChildren: () => import('./detalles-cotizacion/detalles-cotizacion.module').then( m => m.DetallesCotizacionPageModule)
  },
  {
    path: 'pos',
    loadChildren: () => import('./pos/pos.module').then( m => m.POSPageModule)
  },
  {
    path: 'num-cot',
    loadChildren: () => import('./num-cot/num-cot.module').then( m => m.NumCotPageModule)
  },
  {
    path: 'modal-vincular-cliente',
    loadChildren: () => import('./modal-vincular-cliente/modal-vincular-cliente.module').then( m => m.ModalVincularClientePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CotizacionesPageRoutingModule {}
