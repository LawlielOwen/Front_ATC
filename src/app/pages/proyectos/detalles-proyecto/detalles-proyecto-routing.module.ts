import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesProyectoPage } from './detalles-proyecto.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesProyectoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesProyectoPageRoutingModule {}
