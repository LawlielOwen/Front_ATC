import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalValePageRoutingModule } from './modal-vale-routing.module';

import { ModalValePage } from './modal-vale.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalValePageRoutingModule
  ],
})
export class ModalValePageModule {}
