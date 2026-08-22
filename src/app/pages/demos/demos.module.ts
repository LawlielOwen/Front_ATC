import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemosPageRoutingModule } from './demos-routing.module';

import { DemosPage } from './demos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemosPageRoutingModule
  ],
})
export class DemosPageModule {}
