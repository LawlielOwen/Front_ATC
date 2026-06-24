import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubirReciboPage } from './subir-recibo.page';

const routes: Routes = [
  {
    path: '',
    component: SubirReciboPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubirReciboPageRoutingModule {}
