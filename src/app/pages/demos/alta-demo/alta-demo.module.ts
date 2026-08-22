import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AltaDemoPageRoutingModule } from './alta-demo-routing.module';

import { AltaDemoPage } from './alta-demo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AltaDemoPageRoutingModule
  ],
})
export class AltaDemoPageModule {}
