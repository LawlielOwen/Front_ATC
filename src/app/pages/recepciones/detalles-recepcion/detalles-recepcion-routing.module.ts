import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesRecepcionPage } from './detalles-recepcion.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesRecepcionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesRecepcionPageRoutingModule {}
