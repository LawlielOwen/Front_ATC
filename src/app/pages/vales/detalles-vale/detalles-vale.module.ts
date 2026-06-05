import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesValePageRoutingModule } from './detalles-vale-routing.module';

import { DetallesValePage } from './detalles-vale.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesValePageRoutingModule
  ],
})
export class DetallesValePageModule {}
