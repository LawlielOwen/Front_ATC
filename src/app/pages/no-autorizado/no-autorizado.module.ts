import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NoAutorizadoPageRoutingModule } from './no-autorizado-routing.module';

import { NoAutorizadoPage } from './no-autorizado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoAutorizadoPageRoutingModule
  ],

})
export class NoAutorizadoPageModule {}
