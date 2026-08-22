import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalDemoPage } from './modal-demo.page';

const routes: Routes = [
  {
    path: '',
    component: ModalDemoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalDemoPageRoutingModule {}
