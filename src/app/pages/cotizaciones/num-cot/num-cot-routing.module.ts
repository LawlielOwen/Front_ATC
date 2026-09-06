import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NumCotPage } from './num-cot.page';

const routes: Routes = [
  {
    path: '',
    component: NumCotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NumCotPageRoutingModule {}
