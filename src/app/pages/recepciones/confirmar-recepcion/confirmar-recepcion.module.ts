import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmarRecepcionPageRoutingModule } from './confirmar-recepcion-routing.module';

import { ConfirmarRecepcionPage } from './confirmar-recepcion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmarRecepcionPageRoutingModule
  ],
})
export class ConfirmarRecepcionPageModule {}
