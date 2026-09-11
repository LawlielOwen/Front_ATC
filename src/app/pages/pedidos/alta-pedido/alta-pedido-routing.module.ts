import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AltaPedidoPage } from './alta-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: AltaPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AltaPedidoPageRoutingModule {}
