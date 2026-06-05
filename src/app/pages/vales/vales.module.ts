import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ValesPageRoutingModule } from './vales-routing.module';

import { ValesPage } from './vales.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ValesPageRoutingModule
  ],
})
export class ValesPageModule {}
