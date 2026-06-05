import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialESPageRoutingModule } from './historial-es-routing.module';

import { HistorialESPage } from './historial-es.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialESPageRoutingModule
  ],
})
export class HistorialESPageModule {}
