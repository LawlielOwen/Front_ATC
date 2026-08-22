import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompletarVisitaPage } from './completar-visita.page';

const routes: Routes = [
  {
    path: '',
    component: CompletarVisitaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompletarVisitaPageRoutingModule {}
