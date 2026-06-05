import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalValePage } from './modal-vale.page';

const routes: Routes = [
  {
    path: '',
    component: ModalValePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalValePageRoutingModule {}
