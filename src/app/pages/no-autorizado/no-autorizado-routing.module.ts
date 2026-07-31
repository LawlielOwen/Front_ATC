import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NoAutorizadoPage } from './no-autorizado.page';

const routes: Routes = [
  {
    path: '',
    component: NoAutorizadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoAutorizadoPageRoutingModule {}
