import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalDemoPageRoutingModule } from './modal-demo-routing.module';

import { ModalDemoPage } from './modal-demo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalDemoPageRoutingModule
  ],

})
export class ModalDemoPageModule {}
