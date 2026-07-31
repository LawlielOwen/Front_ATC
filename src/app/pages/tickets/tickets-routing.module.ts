import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TicketsPage } from './tickets.page';

const routes: Routes = [
  {
    path: '',
    component: TicketsPage
  },  {
    path: 'modal-ticket',
    loadChildren: () => import('./modal-ticket/modal-ticket.module').then( m => m.ModalTicketPageModule)
  },
  {
    path: 'detalle-ticket',
    loadChildren: () => import('./detalle-ticket/detalle-ticket.module').then( m => m.DetalleTicketPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsPageRoutingModule {}
