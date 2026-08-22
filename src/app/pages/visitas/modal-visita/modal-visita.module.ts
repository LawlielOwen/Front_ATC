import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalVisitaPageRoutingModule } from './modal-visita-routing.module';

import { ModalVisitaPage } from './modal-visita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalVisitaPageRoutingModule
  ],
})
export class ModalVisitaPageModule {}
