import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesDemoPage } from './detalles-demo.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesDemoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesDemoPageRoutingModule {}
