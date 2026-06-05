import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesValePage } from './detalles-vale.page';

const routes: Routes = [
  {
    path: '',
    component: DetallesValePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesValePageRoutingModule {}
