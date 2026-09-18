import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolioValePageRoutingModule } from './folio-vale-routing.module';

import { FolioValePage } from './folio-vale.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolioValePageRoutingModule
  ],
})
export class FolioValePageModule {}
