import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleTicketPage } from './detalle-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleTicketPageRoutingModule {}
