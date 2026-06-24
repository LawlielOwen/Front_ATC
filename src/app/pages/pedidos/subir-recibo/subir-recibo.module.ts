import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubirReciboPageRoutingModule } from './subir-recibo-routing.module';

import { SubirReciboPage } from './subir-recibo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubirReciboPageRoutingModule
  ],
})
export class SubirReciboPageModule {}
