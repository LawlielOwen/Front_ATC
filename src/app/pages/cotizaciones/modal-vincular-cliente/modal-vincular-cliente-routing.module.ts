import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalVincularClientePage } from './modal-vincular-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: ModalVincularClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalVincularClientePageRoutingModule {}
