import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesCotizacionPageRoutingModule } from './detalles-cotizacion-routing.module';

import { DetallesCotizacionPage } from './detalles-cotizacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesCotizacionPageRoutingModule
  ],
})
export class DetallesCotizacionPageModule {}
