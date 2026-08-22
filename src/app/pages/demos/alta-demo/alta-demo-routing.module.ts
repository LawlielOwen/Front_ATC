import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AltaDemoPage } from './alta-demo.page';

const routes: Routes = [
  {
    path: '',
    component: AltaDemoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AltaDemoPageRoutingModule {}
