import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleVisitaPage } from './detalle-visita.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleVisitaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleVisitaPageRoutingModule {}
