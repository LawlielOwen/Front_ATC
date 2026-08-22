import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalVisitaPage } from './modal-visita.page';

const routes: Routes = [
  {
    path: '',
    component: ModalVisitaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalVisitaPageRoutingModule {}
