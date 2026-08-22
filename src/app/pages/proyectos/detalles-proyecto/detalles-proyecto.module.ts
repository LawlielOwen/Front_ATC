import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesProyectoPageRoutingModule } from './detalles-proyecto-routing.module';

import { DetallesProyectoPage } from './detalles-proyecto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesProyectoPageRoutingModule
  ],
})
export class DetallesProyectoPageModule {}
