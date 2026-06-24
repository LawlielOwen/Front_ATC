import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAsesorPageRoutingModule } from './modal-asesor-routing.module';

import { ModalAsesorPage } from './modal-asesor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalAsesorPageRoutingModule
  ],
})
export class ModalAsesorPageModule {}
