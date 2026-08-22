import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleVisitaPageRoutingModule } from './detalle-visita-routing.module';

import { DetalleVisitaPage } from './detalle-visita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleVisitaPageRoutingModule
  ],
})
export class DetalleVisitaPageModule {}
