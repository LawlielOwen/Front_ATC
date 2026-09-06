import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NumCotPageRoutingModule } from './num-cot-routing.module';

import { NumCotPage } from './num-cot.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NumCotPageRoutingModule
  ],
})
export class NumCotPageModule {}
