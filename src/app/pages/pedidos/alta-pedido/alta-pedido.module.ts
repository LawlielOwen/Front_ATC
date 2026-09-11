import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AltaPedidoPageRoutingModule } from './alta-pedido-routing.module';

import { AltaPedidoPage } from './alta-pedido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AltaPedidoPageRoutingModule
  ],
})
export class AltaPedidoPageModule {}
