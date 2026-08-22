import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompletarVisitaPageRoutingModule } from './completar-visita-routing.module';

import { CompletarVisitaPage } from './completar-visita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompletarVisitaPageRoutingModule
  ],
})
export class CompletarVisitaPageModule {}
