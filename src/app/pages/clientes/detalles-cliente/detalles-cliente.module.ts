import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesClientePageRoutingModule } from './detalles-cliente-routing.module';

import { DetallesClientePage } from './detalles-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesClientePageRoutingModule
  ],

})
export class DetallesClientePageModule {}
