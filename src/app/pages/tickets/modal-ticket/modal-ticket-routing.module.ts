import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalTicketPage } from './modal-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTicketPageRoutingModule {}
