import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalRepecionPageRoutingModule } from './modal-repecion-routing.module';

import { ModalRepecionPage } from './modal-repecion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalRepecionPageRoutingModule
  ],
})
export class ModalRepecionPageModule {}
