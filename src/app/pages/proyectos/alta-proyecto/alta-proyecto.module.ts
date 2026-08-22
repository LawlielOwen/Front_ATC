import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AltaProyectoPageRoutingModule } from './alta-proyecto-routing.module';

import { AltaProyectoPage } from './alta-proyecto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AltaProyectoPageRoutingModule
  ],
})
export class AltaProyectoPageModule {}
