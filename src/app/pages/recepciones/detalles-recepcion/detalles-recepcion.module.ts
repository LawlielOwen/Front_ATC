import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesRecepcionPageRoutingModule } from './detalles-recepcion-routing.module';

import { DetallesRecepcionPage } from './detalles-recepcion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesRecepcionPageRoutingModule
  ],
})
export class DetallesRecepcionPageModule {}
