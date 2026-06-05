import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExistenciasPageRoutingModule } from './existencias-routing.module';

import { ExistenciasPage } from './existencias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExistenciasPageRoutingModule
  ],
})
export class ExistenciasPageModule {}
