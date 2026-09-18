import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FolioValePage } from './folio-vale.page';

const routes: Routes = [
  {
    path: '',
    component: FolioValePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FolioValePageRoutingModule {}
