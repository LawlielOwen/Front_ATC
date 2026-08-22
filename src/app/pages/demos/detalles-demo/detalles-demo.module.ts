import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesDemoPageRoutingModule } from './detalles-demo-routing.module';

import { DetallesDemoPage } from './detalles-demo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesDemoPageRoutingModule
  ],
})
export class DetallesDemoPageModule {}
