import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesCotizacionPage } from './detalles-cotizacion.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesCotizacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesCotizacionPageRoutingModule {}
