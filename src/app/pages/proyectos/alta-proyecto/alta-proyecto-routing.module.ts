import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AltaProyectoPage } from './alta-proyecto.page';

const routes: Routes = [
  {
    path: '',
    component: AltaProyectoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AltaProyectoPageRoutingModule {}
