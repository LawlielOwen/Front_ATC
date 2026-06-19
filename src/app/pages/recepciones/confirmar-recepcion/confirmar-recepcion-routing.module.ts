import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmarRecepcionPage } from './confirmar-recepcion.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmarRecepcionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmarRecepcionPageRoutingModule {}
