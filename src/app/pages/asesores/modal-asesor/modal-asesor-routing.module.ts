import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAsesorPage } from './modal-asesor.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAsesorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAsesorPageRoutingModule {}
