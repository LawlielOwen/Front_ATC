import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecepcionesPageRoutingModule } from './recepciones-routing.module';

import { RecepcionesPage } from './recepciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecepcionesPageRoutingModule
  ],
})
export class RecepcionesPageModule {}
